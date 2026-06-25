# ExactEHRM — Backend Implementation Plan & Progress Tracker

> Internal reference document. Not for production commit.
> Last updated: 2026-06-25
> Status key: ✅ Done | ⚠️ Partial / Wrong | ❌ Missing | 🔴 Bug / Security Risk

---

## CURRENT STATE SNAPSHOT

### What exists in ehrm-new-backend today

| Module | Files | Real DB? | Auth Enforced? | Status |
|---|---|---|---|---|
| Auth (login/register) | `auth.service.ts`, `auth.controller.ts` | ✅ | N/A (public) | ⚠️ Partial |
| IAM (users CRUD) | `iam.controller.ts` | ✅ | 🔴 NO | 🔴 Broken |
| Company CRUD | `company.controller.ts` | ⚠️ Mixed | 🔴 NO | 🔴 Broken |
| CompanySettings | inside company module | ✅ | 🔴 NO | 🔴 Broken |
| Branches / Departments | inside company module | ✅ | 🔴 NO | 🔴 Broken |
| File Upload | inside company module | ✅ disk | 🔴 NO | 🔴 Broken |
| Subscriptions | `subscriptions.service.ts` | ⚠️ Hardcoded | 🔴 NO | ❌ Missing |
| Demo request | `demo.controller.ts` | ✅ | N/A (public) | ✅ OK |
| AI chat | `ai.controller.ts` | OpenAI call | 🔴 NO | ⚠️ Unprotected |
| Guards | — | — | — | ❌ Zero guards |
| Interceptors | — | — | — | ❌ None |
| Middleware | — | — | — | ❌ None |
| Exception filters | — | — | — | ❌ None |
| RBAC enforcement | — | — | — | ❌ Models only |
| Audit logging | — | — | — | ❌ Model only |
| Tenant isolation | — | — | — | ❌ None |
| Super admin | — | — | — | ❌ None |
| Employees module | — | — | — | ❌ None |
| Attendance | — | — | — | ❌ None |
| Leave | — | — | — | ❌ None |
| Payroll | — | — | — | ❌ None |
| Performance | — | — | — | ❌ None |
| Training | — | — | — | ❌ None |
| Notifications | — | — | — | ❌ None |
| Analytics | — | — | — | ❌ None |

### What actually works vs. what's wired but broken

**Actually working (real DB, real logic):**
- `POST /auth/login` — bcrypt compare, JWT issued
- `POST /auth/register` — hashes password, creates user in DB
- `POST /auth/register-workspace` — atomic: creates Company + CompanySettings + User in one transaction
- `GET /auth/me` — manual Bearer extraction, validates token against DB user
- `GET /iam/users` — real DB query (no auth guard — anyone can call it)
- `POST /iam/users` — real DB write (no auth guard)
- `GET|PUT|DELETE /iam/users/:id` — real DB ops (no auth guard)
- `GET /company/companies` — real DB findMany
- `PUT /company/settings/:id` — real DB upsert
- `GET /company/branches` and `GET /company/departments` — real DB queries
- `POST /company/upload` — multer to local disk
- `POST /demo` — real DB write
- `POST /ai/chat` — real OpenAI API call (GPT-4o-mini)

**Wired but broken / incomplete:**
- `CompanyService.create()` — returns `{ id: 'new', ...data }`, never hits DB
- `CompanyService.findAll()` — returns `[]`
- `CompanyService.findOne()` — returns null
- Subscriptions — all hardcoded or zeroed out
- `GET /auth/me` — no guard, manually parses "Bearer {token}" from header
- Refresh token model exists but is never created, validated, or rotated
- Account lockout fields (`failedAttempts`, `lockedUntil`) exist but no logic uses them
- MFA fields (`mfaEnabled`, `mfaSecret`) exist but no logic uses them
- AuditLog model exists but is never written to

---

## DELTA: Plan vs. Reality

### Architecture Decisions — What Needs to Change

| Decision | Plan | Current Reality | Action Required |
|---|---|---|---|
| Database | PostgreSQL | MySQL | **Migrate schema to PostgreSQL** |
| IDs | UUID | CUID | **Change to UUID in schema** |
| JWT signing | RS256 (asymmetric) | HS256 (symmetric) | **Generate RSA key pair, update JwtModule** |
| JWT access token expiry | 15 minutes | 7 days | 🔴 **Fix immediately — tokens never expire** |
| Refresh tokens | Redis (JTI-based) | DB table (unused) | **Implement Redis refresh token flow** |
| ValidationPipe | `whitelist: true, forbidNonWhitelisted: true` | `whitelist: false` | **Fix in main.ts** |
| CORS | Whitelist from env | `origin: '*'` | 🔴 **Fix in main.ts** |
| Logger | Pino JSON | NestJS default | **Add pino-http** |
| Guards | JWT + Permissions + Status | None | 🔴 **Build from scratch** |
| Tenant isolation | AsyncLocalStorage + Prisma middleware | None | **Build from scratch** |
| Response envelope | `{ success, data, meta }` | Raw Prisma objects | **Add ResponseInterceptor** |
| Error handling | GlobalExceptionFilter | None | **Add GlobalExceptionFilter** |
| RBAC | Role.scope GLOBAL/TENANT | No scope field | **Add scope to Role schema** |

---

## Part 1 — Architectural Decisions

### 1. Database
**PostgreSQL, not MySQL.**

> **Current state:** MySQL. The schema uses `@db.Text` (MySQL syntax). Prisma datasource is `mysql`.
> **Action:** Change datasource to PostgreSQL. Replace `@db.Text` with `@db.Text` (compatible) or remove.
> Most field types are compatible. Run fresh migration on PostgreSQL.

Why PostgreSQL:
- Native `gen_random_uuid()`
- `PARTITION BY RANGE` for audit log scalability
- `tsvector` full-text search on employee names
- Better JSON operators for settings/config fields
- Row-level security primitives for future use

### 2. JWT Signing
**RS256 (asymmetric), not HS256.**

> **Current state:** HS256 with `process.env.JWT_SECRET || 'ehrm-super-secret-key-2026'`
> 🔴 **Critical:** Hardcoded fallback means anyone who reads the source can forge tokens.
> **Action:** Generate RSA-2048 key pair, store in env. Update JwtModule config.

```bash
# Run once. Store private.pem in secrets manager (Vault, AWS Secrets Manager, etc.)
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

### 3. Refresh Tokens
**Redis only, never the database.**

> **Current state:** `RefreshToken` model exists in schema. Auth service generates a refresh token
> string but NEVER saves it to the DB. The endpoint `/auth/refresh-token` does not exist.
> The model is completely orphaned.
> **Action:** Remove RefreshToken model from DB. Implement Redis JTI store.

Redis key: `refresh:{jti}` → `{ userId, companyId, rotatedFrom }`, TTL = 7 days

**Token reuse detection:** if old JTI presented after rotation → revoke ALL sessions for that user.

### 4. Multi-tenancy
**AsyncLocalStorage + Prisma middleware.**

> **Current state:** None. No tenant isolation exists. Any authenticated user can potentially
> access any company's data by guessing an ID. IAM and company endpoints have no auth at all.
> **Action:** Build TenantScopeMiddleware + tenantStorage + Prisma RLS middleware in Phase 3.

### 5. User vs. Employee
**Separate models.**

> **Current state:** Only `User` model. `User.companyId` ties a user to a company.
> `User.employeeId` is a nullable string (no FK to any Employee table).
> No Employee model exists.
> **Action:** Keep User as auth entity. Add Employee model in Phase 6.

### 6. Validation
**`whitelist: true, forbidNonWhitelisted: true, transform: true`**

> **Current state:** `whitelist: false` in `main.ts`. All DTOs have zero validation decorators.
> Extra fields in request bodies are silently accepted.
> 🔴 **Fix immediately — this is a security and data integrity risk.**
> **Action:** Fix `main.ts` ValidationPipe. Add `@IsEmail()`, `@IsNotEmpty()`, `@MinLength()` etc.
> to all DTOs.

### 7. Response Shape
**Consistent envelope: `{ success, data, meta }`**

> **Current state:** Controllers return raw Prisma objects or ad-hoc shapes.
> Errors return NestJS defaults (no typed error codes).
> **Action:** Add ResponseInterceptor and GlobalExceptionFilter in Phase 0 fixes.

### 8. PermissionsGuard
**Must be enabled and tested before any endpoint is deployed.**

> **Current state:** Zero guards exist anywhere. `@ApiBearerAuth()` Swagger decorator
> is present but does NOT enforce authentication — it only adds a padlock to the Swagger UI.
> 🔴 **All 24 endpoints are effectively public right now.**
> **Action:** Phase 3 — build JwtAuthGuard, PermissionsGuard, GlobalAdminGuard, StatusGuard.

---

## Part 2 — Project Structure

### Current structure:
```
src/
  common/
    prisma/           ✅ PrismaModule + PrismaService (minimal)
  modules/
    auth/             ⚠️ Partial — login/register works, no guards
    company/          🔴 No auth enforcement, mixed real/mock data
    subscriptions/    ❌ Mostly hardcoded
    demo/             ✅ Works
    ai/               ⚠️ Works but unprotected
  main.ts             ⚠️ Wrong ValidationPipe config, wildcard CORS
  app.module.ts       ✅ Module wiring correct
```

### Target structure:
```
src/
  config/               ← Zod env validation, @nestjs/config [❌ Missing]
  common/
    guards/             ← JwtAuthGuard, GlobalAdminGuard, PermissionsGuard, StatusGuard [❌]
    decorators/         ← @CurrentUser(), @RequirePermissions(), @Public() [❌]
    interceptors/       ← AuditInterceptor, ResponseInterceptor [❌]
    filters/            ← GlobalExceptionFilter [❌]
    middleware/         ← CorrelationIdMiddleware, TenantScopeMiddleware [❌]
    prisma/             ← PrismaModule [✅ exists, needs RLS middleware]
    tenant.storage.ts   ← AsyncLocalStorage singleton [❌]
  redis/                ← RedisModule (ioredis) [❌ Not installed]
  health/               ← GET /health [❌]
  auth/                 ← [⚠️ Move from modules/, expand significantly]
  bootstrap/            ← Startup seeding [❌]
  super-admin/          ← Platform management [❌]
  company/              ← [⚠️ Move from modules/, fix auth]
  employees/            ← [❌]
  attendance/           ← [❌]
  leave/                ← [❌]
  payroll/
    engines/            ← Pure PAYE/NSSF/SDL/WCF functions [❌]
  performance/          ← [❌]
  training/             ← [❌]
  contracts/            ← [❌]
  benefits/             ← [❌]
  compliance/           ← [❌]
  notifications/        ← [❌]
  analytics/            ← [❌]
  ai/                   ← [⚠️ Move from modules/, add auth]
  integrations/         ← [❌]
```

---

## Part 3 — Phase-by-Phase Implementation

---

### Phase 0 — Foundation Fixes (IMMEDIATE — before any new feature)

These are not new features. They are mandatory fixes to the existing codebase.
**Nothing else should be built until Phase 0 is complete.**

#### 0.1 — Fix main.ts

```typescript
// src/main.ts — current (wrong)
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
app.enableCors({ origin: '*' });

// target
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  transformOptions: { enableImplicitConversion: true },
}));
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
```

#### 0.2 — Fix JWT secret (critical)

```typescript
// src/modules/auth/auth.module.ts — current (dangerous)
secret: process.env.JWT_SECRET || 'ehrm-super-secret-key-2026'

// target — Phase 2 will replace with RS256. Immediate fix: remove fallback.
secret: process.env.JWT_SECRET  // throws if undefined — fail fast
// Add to config validation: JWT_SECRET must be set
```

#### 0.3 — Install missing dependencies

```bash
npm install ioredis @nestjs/bullmq bullmq
npm install pino pino-http nestjs-pino
npm install helmet
npm install zod
npm install @nestjs/event-emitter
npm install @nestjs/schedule
```

#### 0.4 — Add Zod config validation

```typescript
// src/config/env.validation.ts
import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  GATEWAY_PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(7),
  HRM_SUPER_ADMIN_EMAIL: z.string().email(),
  OPENAI_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  AT_API_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  ENCRYPTION_KEY: z.string().min(32),
});

export type Env = z.infer<typeof EnvSchema>;
```

App must crash at boot with a clear error if any required var is missing.

#### 0.5 — Add GlobalExceptionFilter

```typescript
// src/common/filters/global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = typeof res === 'string' ? res : res.message || message;
      code = this.resolveCode(status, message);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = 409;
        code = 'CONFLICT';
        message = `${exception.meta?.target} already exists`;
      } else if (exception.code === 'P2025') {
        status = 404;
        code = 'NOT_FOUND';
        message = 'Record not found';
      }
    }

    // Never expose stack traces in production
    response.status(status).json({
      success: false,
      error: { code, message },
      meta: { requestId: request.headers['x-request-id'], timestamp: new Date().toISOString() },
    });
  }
}
```

#### 0.6 — Add ResponseInterceptor

```typescript
// src/common/interceptors/response.interceptor.ts
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const req = ctx.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          requestId: req.headers['x-request-id'],
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
```

#### 0.7 — Add CorrelationIdMiddleware

```typescript
// src/common/middleware/correlation-id.middleware.ts
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = req.headers['x-request-id'] as string || randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-Id', id);
    next();
  }
}
```

#### 0.8 — Add Helmet

```typescript
// src/main.ts
import helmet from 'helmet';
app.use(helmet());
```

#### 0.9 — Add Health Check endpoint

```typescript
// src/health/health.controller.ts
@Get('/health')
async check() {
  const dbOk = await this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  const redisOk = await this.redis.ping().then(() => true).catch(() => false);
  return { db: dbOk ? 'ok' : 'error', redis: redisOk ? 'ok' : 'error', uptime: process.uptime() };
}
```

#### 0.10 — Add validation decorators to all existing DTOs

```typescript
// src/modules/auth/auth.dto.ts — current (no validation)
export class LoginDto {
  email: string;
  password: string;
}

// target
export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

All DTOs in `auth.dto.ts`, `dto.ts` need the same treatment.

**Phase 0 Checklist:**
- [ ] Fix `ValidationPipe` in `main.ts` (`whitelist: true, forbidNonWhitelisted: true`)
- [ ] Fix CORS in `main.ts` (whitelist from env, not `*`)
- [ ] Remove hardcoded JWT secret fallback
- [ ] Add Zod env validation (crash on missing required vars)
- [ ] Add `helmet()`
- [ ] Add `GlobalExceptionFilter`
- [ ] Add `ResponseInterceptor`
- [ ] Add `CorrelationIdMiddleware`
- [ ] Add `GET /health` endpoint
- [ ] Add validation decorators to all DTOs
- [ ] Install: `ioredis`, `bullmq`, `pino`, `helmet`, `zod`, `@nestjs/event-emitter`, `@nestjs/schedule`

---

### Phase 1 — Database Schema Migration (Week 1–2)

> **Current state:** MySQL schema with CUID IDs. Has solid foundations for auth/company.
> Missing: Employee, Attendance, Leave, Payroll, Performance, Training, Contracts,
> Benefits, Compliance, OTP, ImpersonationAudit, Plan, Subscription, Invoice,
> BrandingConfig, Notification, Role.scope field.

#### 1.1 — Switch to PostgreSQL

Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"   // was "mysql"
  url      = env("DATABASE_URL")
}
```

Update Docker Compose to use PostgreSQL 16 instead of MySQL.

#### 1.2 — Switch IDs to UUID

```prisma
// Every model: change @default(cuid()) to @default(uuid())
id String @id @default(uuid())
```

#### 1.3 — Add missing fields to existing models

**Role — add `scope` field (critical for RBAC):**
```prisma
model Role {
  // existing fields...
  scope     RoleScope @default(TENANT)  // ADD THIS
  slug      String?                      // ADD THIS (e.g. "company-admin")
  isActive  Boolean   @default(true)     // ADD THIS
  createdBy String?                      // ADD THIS

  @@unique([name, companyId])
}

enum RoleScope {
  GLOBAL
  TENANT
}
```

**User — add missing fields:**
```prisma
model User {
  // existing fields...
  deletedAt   DateTime?    // ADD — soft delete
  createdBy   String?      // ADD — audit trail
  updatedBy   String?      // ADD — audit trail
  // Remove: password (move to separate auth strategy if OTP-only)
  // Keep: password for email+password login path
}
```

**AuditLog — expand for impersonation tracking:**
```prisma
model AuditLog {
  // existing: userId, companyId, action, resource, details, ipAddress, userAgent
  // ADD:
  actorType        String  @default("USER")    // USER | SYSTEM
  originalActorId  String?                      // for impersonation
  resourceId       String?                      // ID of affected record
  before           Json?                        // snapshot before change
  after            Json?                        // snapshot after change
  requestId        String?                      // correlation ID
}
```

**Company — add missing fields:**
```prisma
model Company {
  // existing fields...
  tin          String?   @unique   // ADD — Tanzania TIN
  deletedAt    DateTime?           // ADD — soft delete
  workspaceType String?            // ADD — SaaS | OnPremise
  planId       String?             // ADD — FK to Plan
  createdBy    String?             // ADD
  updatedBy    String?             // ADD
}
```

#### 1.4 — Add entirely new models

**OTP codes (for OTP login flow):**
```prisma
model OtpCode {
  id        String    @id @default(uuid())
  userId    String
  codeHash  String
  type      String    // EMAIL | PHONE
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@map("otp_codes")
}
```

**Impersonation audit:**
```prisma
model ImpersonationAudit {
  id              String    @id @default(uuid())
  superAdminId    String
  targetCompanyId String
  issuedAt        DateTime  @default(now())
  expiresAt       DateTime
  revokedAt       DateTime?
  ipAddress       String?
  userAgent       String?
  @@index([superAdminId])
  @@index([targetCompanyId])
  @@map("impersonation_audits")
}
```

**Plans and Subscriptions:**
```prisma
model Plan {
  id           String   @id @default(uuid())
  name         String   @unique
  slug         String   @unique
  monthlyPrice Decimal  @db.Decimal(10, 2)
  annualPrice  Decimal? @db.Decimal(10, 2)
  maxEmployees Int?
  maxStorage   Int?
  features     Json
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@map("plans")
}

model Subscription {
  id                 String   @id @default(uuid())
  companyId          String   @unique
  planId             String
  status             String   @default("ACTIVE")
  billingInterval    String   @default("MONTHLY")
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  trialEndsAt        DateTime?
  cancelAt           DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  invoices           Invoice[]
  @@index([companyId])
  @@map("subscriptions")
}

model Invoice {
  id             String   @id @default(uuid())
  companyId      String
  subscriptionId String
  amount         Decimal  @db.Decimal(10, 2)
  currency       String   @default("TZS")
  status         String   @default("PENDING")
  dueAt          DateTime
  paidAt         DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@index([companyId])
  @@map("invoices")
}
```

**Employee (separate from User):**
```prisma
model Employee {
  id                String         @id @default(uuid())
  companyId         String
  userId            String?        @unique
  employeeNumber    String
  firstName         String
  lastName          String
  middleName        String?
  gender            Gender
  dateOfBirth       DateTime?
  nationality       String?
  nationalId        String?
  tin               String?
  nssfNumber        String?
  psssfNumber       String?
  phone             String?
  personalEmail     String?
  status            EmployeeStatus @default(ACTIVE)
  hireDate          DateTime
  confirmationDate  DateTime?
  probationEndDate  DateTime?
  terminationDate   DateTime?
  departmentId      String?
  branchId          String?
  jobTitleId        String?
  gradeId           String?
  managerId         String?
  employmentType    String         @default("PERMANENT")
  modeOfPayment     String         @default("BANK_TRANSFER")
  bankName          String?
  bankAccountNumber String?
  bankSortCode      String?
  deletedAt         DateTime?
  createdBy         String?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  @@unique([companyId, employeeNumber])
  @@index([companyId])
  @@index([companyId, status])
  @@index([companyId, departmentId])
  @@index([managerId])
  @@map("employees")
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  SUSPENDED
  TERMINATED
  DELETED
}

enum Gender {
  MALE
  FEMALE
  OTHER
}
```

**Job Titles and Pay Grades:**
```prisma
model JobTitle {
  id        String   @id @default(uuid())
  companyId String
  name      String
  code      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([companyId])
  @@map("job_titles")
}

model PayGrade {
  id         String   @id @default(uuid())
  companyId  String
  name       String
  level      Int
  minSalary  Decimal  @db.Decimal(15, 2)
  maxSalary  Decimal  @db.Decimal(15, 2)
  currency   String   @default("TZS")
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([companyId])
  @@map("pay_grades")
}
```

**Attendance:**
```prisma
model Shift {
  id              String   @id @default(uuid())
  companyId       String
  name            String
  startTime       String
  endTime         String
  gracePeriodMins Int      @default(15)
  isNightShift    Boolean  @default(false)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([companyId])
  @@map("shifts")
}

model AttendanceRecord {
  id           String   @id @default(uuid())
  companyId    String
  employeeId   String
  date         DateTime @db.Date
  clockIn      DateTime?
  clockOut     DateTime?
  hoursWorked  Decimal? @db.Decimal(5, 2)
  status       String   // PRESENT | ABSENT | LATE | HALF_DAY | ON_LEAVE
  source       String   // MANUAL | BIOMETRIC | MOBILE
  biometricRef String?  @unique
  notes        String?
  recordedBy   String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@unique([companyId, employeeId, date])
  @@index([companyId, date])
  @@index([employeeId])
  @@map("attendance_records")
}
```

**Leave:**
```prisma
model LeaveType {
  id               String   @id @default(uuid())
  companyId        String
  name             String
  code             String
  daysPerYear      Decimal  @db.Decimal(5, 1)
  isPaid           Boolean  @default(true)
  isCarryOver      Boolean  @default(false)
  maxCarryOverDays Int?
  gender           String?  // null=all, FEMALE=maternity, MALE=paternity
  minServiceDays   Int      @default(0)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  @@unique([companyId, code])
  @@index([companyId])
  @@map("leave_types")
}

model LeaveBalance {
  id          String   @id @default(uuid())
  companyId   String
  employeeId  String
  leaveTypeId String
  year        Int
  allocated   Decimal  @db.Decimal(5, 1)
  used        Decimal  @db.Decimal(5, 1) @default(0)
  pending     Decimal  @db.Decimal(5, 1) @default(0)
  carried     Decimal  @db.Decimal(5, 1) @default(0)
  updatedAt   DateTime @updatedAt
  @@unique([companyId, employeeId, leaveTypeId, year])
  @@index([companyId, employeeId])
  @@map("leave_balances")
}

model LeaveRequest {
  id          String    @id @default(uuid())
  companyId   String
  employeeId  String
  leaveTypeId String
  startDate   DateTime  @db.Date
  endDate     DateTime  @db.Date
  days        Decimal   @db.Decimal(5, 1)
  reason      String?
  status      String    @default("PENDING")
  approverId  String?
  approvedAt  DateTime?
  comments    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@index([companyId, employeeId])
  @@index([companyId, status])
  @@map("leave_requests")
}
```

**Payroll:**
```prisma
model PayrollRun {
  id              String    @id @default(uuid())
  companyId       String
  month           String    // "2026-06"
  status          String    @default("DRAFT")
  processedAt     DateTime?
  processedBy     String?
  approvedBy      String?
  approvedAt      DateTime?
  totalGross      Decimal?  @db.Decimal(15, 2)
  totalNet        Decimal?  @db.Decimal(15, 2)
  totalDeductions Decimal?  @db.Decimal(15, 2)
  totalPaye       Decimal?  @db.Decimal(15, 2)
  totalNssf       Decimal?  @db.Decimal(15, 2)
  createdBy       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  slips           PayrollSlip[]
  @@unique([companyId, month])
  @@index([companyId])
  @@map("payroll_runs")
}

model PayrollSlip {
  id                 String   @id @default(uuid())
  companyId          String
  payrollRunId       String
  employeeId         String
  basicSalary        Decimal  @db.Decimal(15, 2)
  allowances         Json?
  grossSalary        Decimal  @db.Decimal(15, 2)
  paye               Decimal  @db.Decimal(15, 2)
  nssfEmployee       Decimal  @db.Decimal(15, 2)
  nssfEmployer       Decimal  @db.Decimal(15, 2)
  sdl                Decimal  @db.Decimal(15, 2)
  wcf                Decimal  @db.Decimal(15, 2)
  otherDeductions    Json?
  totalDeductions    Decimal  @db.Decimal(15, 2)
  netSalary          Decimal  @db.Decimal(15, 2)
  disbursementStatus String   @default("PENDING")
  bankRef            String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  payrollRun         PayrollRun @relation(fields: [payrollRunId], references: [id])
  @@unique([payrollRunId, employeeId])
  @@index([companyId])
  @@index([employeeId])
  @@map("payroll_slips")
}

model PayeBracket {
  id          String   @id @default(uuid())
  companyId   String
  fromAmount  Decimal  @db.Decimal(15, 2)
  toAmount    Decimal? @db.Decimal(15, 2)
  rate        Decimal  @db.Decimal(5, 4)
  fixedAmount Decimal  @db.Decimal(15, 2) @default(0)
  year        Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  @@index([companyId, year])
  @@map("paye_brackets")
}
```

**Platform config:**
```prisma
model BrandingConfig {
  id             String   @id @default(uuid())
  companyId      String   @unique
  primaryColor   String?
  secondaryColor String?
  logoUrl        String?
  faviconUrl     String?
  customDomain   String?  @unique
  sslStatus      String?
  loginBackground String?
  emailFooter    String?
  updatedAt      DateTime @updatedAt
  createdAt      DateTime @default(now())
  @@map("branding_configs")
}

model Notification {
  id          String    @id @default(uuid())
  companyId   String?
  recipientId String
  type        String
  title       String
  body        String
  data        Json?
  readAt      DateTime?
  channel     String    // EMAIL | SMS | IN_APP
  createdAt   DateTime  @default(now())
  @@index([recipientId, readAt])
  @@index([companyId])
  @@map("notifications")
}

model ApiKey {
  id          String    @id @default(uuid())
  name        String
  keyHash     String    @unique
  prefix      String
  ownerId     String?
  companyId   String?
  permissions Json?
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())
  @@index([companyId])
  @@map("api_keys")
}
```

**Phase 1 Checklist:**
- [ ] Switch Prisma datasource to PostgreSQL
- [ ] Change all `@default(cuid())` to `@default(uuid())`
- [ ] Add `scope` field to `Role` model
- [ ] Add `slug`, `isActive`, `createdBy` to `Role`
- [ ] Add `deletedAt` to `User`, `Company`, `Employee`
- [ ] Add `tin` to `Company`
- [ ] Expand `AuditLog` with `actorType`, `originalActorId`, `resourceId`, `before`, `after`, `requestId`
- [ ] Add `OtpCode` model
- [ ] Add `ImpersonationAudit` model
- [ ] Add `Plan`, `Subscription`, `Invoice` models
- [ ] Add `Employee` model + enums
- [ ] Add `JobTitle`, `PayGrade` models
- [ ] Add `Shift`, `AttendanceRecord` models
- [ ] Add `LeaveType`, `LeaveBalance`, `LeaveRequest` models
- [ ] Add `PayrollRun`, `PayrollSlip`, `PayeBracket` models
- [ ] Add `BrandingConfig`, `Notification`, `ApiKey` models
- [ ] Remove `RefreshToken` model (moving to Redis)
- [ ] Remove `PasswordReset` model (using OTP instead)
- [ ] Run `prisma migrate dev --name postgresql-foundation`
- [ ] Verify all indexes are in place

---

### Phase 2 — Auth Rebuild (Week 2–3)

> **Current state:** Basic email+password login exists and works.
> `POST /auth/login` → bcrypt compare → JWT issued (7d, HS256).
> `POST /auth/register-workspace` → creates Company + CompanySettings + User atomically ✅
> Missing: OTP flow, refresh token rotation, logout, switch-company, RS256, 15-min tokens.

**What to keep from current implementation:**
- The `register-workspace` transaction logic (clean, atomic) — keep and harden
- bcrypt password hashing at 12 rounds — keep
- The `auth.module.ts` wiring pattern — keep

**What to replace:**
- HS256 → RS256
- 7d access token → 15min access token
- DB refresh tokens → Redis JTI rotation
- Manual Bearer extraction in `/auth/me` → JwtAuthGuard

#### 2.1 — JWT Module update (RS256)

```typescript
// src/auth/auth.module.ts
JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    privateKey: config.get('JWT_PRIVATE_KEY'),
    publicKey: config.get('JWT_PUBLIC_KEY'),
    signOptions: {
      algorithm: 'RS256',
      expiresIn: config.get('JWT_ACCESS_EXPIRES_IN'),  // '15m'
    },
    verifyOptions: { algorithms: ['RS256'] },
  }),
})
```

#### 2.2 — JWT payload structure

```typescript
interface JwtPayload {
  sub: string;                   // userId
  email?: string;
  roles: Array<{
    roleId: string;
    roleName: string;
    scope: 'GLOBAL' | 'TENANT';
    companyId?: string;
  }>;
  permissions: string[];         // ["employees.read", "payroll.write"]
  selectedCompanyId?: string;
  isSuperAdmin: boolean;
  isImpersonating: boolean;
  originalAdminId?: string;
  jti: string;                   // UUID — enables per-token revocation
}
```

#### 2.3 — Auth endpoints

| Method | Path | Current | Action |
|---|---|---|---|
| POST | /auth/login | ✅ Works | Fix: 15min token, RS256, enforce lockout |
| POST | /auth/register | ✅ Works | Add validation decorators to DTO |
| POST | /auth/register-workspace | ✅ Works | Harden: add plan/subscription creation |
| GET | /auth/me | ⚠️ Works without guard | Replace manual parsing with JwtAuthGuard |
| POST | /auth/request-otp | ❌ Missing | Add OTP generation + email/SMS dispatch |
| POST | /auth/verify-otp | ❌ Missing | Add OTP verify + issue JWT |
| POST | /auth/refresh-token | ❌ Missing | Add Redis JTI rotation |
| POST | /auth/logout | ❌ Missing | Add Redis JTI deletion |
| POST | /auth/switch-company/:id | ❌ Missing | Re-issue token with new selectedCompanyId |

#### 2.4 — Account lockout (use existing fields)

```typescript
// These fields already exist on User model — just add the logic
async validateLogin(email: string, password: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedException('Invalid credentials');

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new UnauthorizedException('Account locked. Try again later.');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const attempts = user.failedAttempts + 1;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: attempts,
        lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60_000) : null,
      },
    });
    throw new UnauthorizedException('Invalid credentials');
  }

  // Reset on success
  await this.prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}
```

#### 2.5 — Refresh token (Redis)

```typescript
// Store on login:
const jti = randomUUID();
await this.redis.setex(
  `refresh:${jti}`,
  7 * 24 * 3600,  // 7 days
  JSON.stringify({ userId: user.id, companyId: selectedCompanyId })
);

// Rotate on /auth/refresh-token:
async rotateRefreshToken(oldJti: string): Promise<TokenPair> {
  const stored = await this.redis.get(`refresh:${oldJti}`);
  if (!stored) {
    // Check if recently rotated (reuse detection grace window: 30s)
    const wasRotated = await this.redis.get(`refresh:rotated:${oldJti}`);
    if (!wasRotated) {
      // Token reuse — nuke all sessions
      // (Need userId from somewhere — store separately or fail closed)
      throw new UnauthorizedException('AUTH_TOKEN_REUSE_DETECTED');
    }
  }
  const { userId, companyId } = JSON.parse(stored);
  // Delete old JTI, mark as rotated briefly
  await this.redis.del(`refresh:${oldJti}`);
  await this.redis.setex(`refresh:rotated:${oldJti}`, 30, '1');
  // Issue new pair
  return this.issueTokenPair(userId, companyId);
}
```

**Phase 2 Checklist:**
- [ ] Generate RSA-2048 key pair, add to `.env`
- [ ] Update `JwtModule` to RS256
- [ ] Change access token expiry to 15 minutes
- [ ] Add `jti: randomUUID()` to every token issued
- [ ] Implement Redis refresh token store (replace DB `RefreshToken` model)
- [ ] Add `POST /auth/refresh-token` endpoint
- [ ] Add `POST /auth/logout` endpoint
- [ ] Add `POST /auth/request-otp` endpoint
- [ ] Add `POST /auth/verify-otp` endpoint
- [ ] Add `POST /auth/switch-company/:id` endpoint
- [ ] Fix `GET /auth/me` to use JwtAuthGuard (not manual header parsing)
- [ ] Add account lockout logic to login
- [ ] Add validation decorators to all auth DTOs

---

### Phase 3 — RBAC + Tenant Isolation (Week 3)

> **Current state:** Zero guards anywhere. Role/Permission/UserRole/RolePermission models exist
> but are completely inert. Every single endpoint is wide open.
> **This is the most critical phase. Must be completed before ANY other module ships.**

#### 3.1 — JwtAuthGuard

```typescript
// src/common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(ctx: ExecutionContext) {
    // Allow @Public() decorated routes through
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(ctx);
  }
}
```

Mark public routes with `@Public()` decorator:
```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Public routes: `POST /auth/login`, `POST /auth/register`, `POST /auth/register-workspace`,
`POST /auth/request-otp`, `POST /auth/verify-otp`, `POST /demo`, `GET /health`.

#### 3.2 — PermissionsGuard (DO NOT COMMENT OUT)

```typescript
// src/common/guards/permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = ctx.switchToHttp().getRequest();
    if (!user) return false;

    return required.every((perm) => user.permissions?.includes(perm));
  }
}
```

#### 3.3 — GlobalAdminGuard

```typescript
// src/common/guards/global-admin.guard.ts
@Injectable()
export class GlobalAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const { user } = ctx.switchToHttp().getRequest();
    if (!user) throw new UnauthorizedException();

    if (user.isImpersonating) {
      throw new ForbiddenException('Impersonated sessions cannot access super admin routes');
    }
    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Super admin access required');
    }
    return true;
  }
}
```

#### 3.4 — StatusGuard (Redis cache — NOT raw DB per request)

```typescript
// src/common/guards/status.guard.ts
@Injectable()
export class StatusGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { user } = ctx.switchToHttp().getRequest();
    if (!user || user.isSuperAdmin) return true;  // super admin bypasses

    const cacheKey = `employee:status:${user.sub}`;
    let status = await this.redis.get(cacheKey);

    if (!status) {
      const emp = await this.prisma.employee.findFirst({
        where: { userId: user.sub },
        select: { status: true },
      });
      status = emp?.status ?? 'NO_EMPLOYEE';
      await this.redis.setex(cacheKey, 300, status);  // 5 min TTL
    }

    if (status === 'TERMINATED' || status === 'DELETED') {
      throw new ForbiddenException('Employee account is inactive');
    }
    return true;
  }
}
```

#### 3.5 — Wire guards globally in AppModule

```typescript
// src/app.module.ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },        // 1st: validates token
  { provide: APP_GUARD, useClass: GlobalAdminGuard },    // 2nd: blocks impersonation on /super-admin
  { provide: APP_GUARD, useClass: PermissionsGuard },    // 3rd: checks permissions
  { provide: APP_GUARD, useClass: StatusGuard },         // 4th: checks employee status
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
],
```

#### 3.6 — TenantScopeMiddleware + AsyncLocalStorage

```typescript
// src/common/tenant.storage.ts
import { AsyncLocalStorage } from 'async_hooks';
export const tenantStorage = new AsyncLocalStorage<{ companyId: string; bypassRls: boolean }>();

// src/common/middleware/tenant-scope.middleware.ts
@Injectable()
export class TenantScopeMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const user = req.user as any;
    if (!user) return next();

    const companyId = user.selectedCompanyId ?? user.roles?.[0]?.companyId;
    const bypassRls = Boolean(user.isSuperAdmin);

    if (!companyId && !bypassRls) return next();

    tenantStorage.run({ companyId: companyId ?? '__SUPER_ADMIN__', bypassRls }, () => next());
  }
}
```

#### 3.7 — Prisma RLS middleware

```typescript
// src/common/prisma/prisma.service.ts — add in constructor
const TENANT_MODELS = new Set([
  'Employee', 'AttendanceRecord', 'LeaveRequest', 'LeaveBalance',
  'PayrollRun', 'PayrollSlip', 'PerformanceReview',
  'LeaveType', 'Shift', 'JobTitle', 'PayGrade',
]);

this.$use(async (params, next) => {
  const store = tenantStorage.getStore();
  if (!store || store.bypassRls) return next(params);
  if (!TENANT_MODELS.has(params.model!)) return next(params);

  if (['findMany', 'findFirst', 'count', 'aggregate'].includes(params.action)) {
    params.args.where = { ...params.args.where, companyId: store.companyId, deletedAt: null };
  }
  if (['create'].includes(params.action)) {
    params.args.data = { ...params.args.data, companyId: store.companyId };
  }
  if (['createMany'].includes(params.action)) {
    params.args.data = params.args.data.map((d: any) => ({ ...d, companyId: store.companyId }));
  }
  if (['update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)) {
    params.args.where = { ...params.args.where, companyId: store.companyId };
  }
  return next(params);
});
```

#### 3.8 — Bootstrap service (seed super admin on startup)

```typescript
// src/bootstrap/bootstrap.service.ts
@Injectable()
export class BootstrapService implements OnModuleInit {
  async onModuleInit() {
    await this.ensureSuperAdminUser();
    await this.ensurePermissions();
    await this.ensureSuperAdminRole();
    await this.grantAllPermissions();
    await this.assignRoleToUser();
  }
}
```

Permission seed:
```typescript
export const PERMISSIONS = [
  // Each module: read, write, delete, manage
  'employees.read', 'employees.write', 'employees.delete', 'employees.manage',
  'attendance.read', 'attendance.write', 'attendance.delete', 'attendance.manage',
  'leave.read', 'leave.write', 'leave.delete', 'leave.manage',
  'payroll.read', 'payroll.write', 'payroll.delete', 'payroll.manage',
  'performance.read', 'performance.write', 'performance.delete', 'performance.manage',
  'training.read', 'training.write', 'training.delete', 'training.manage',
  'contracts.read', 'contracts.write', 'contracts.delete', 'contracts.manage',
  'benefits.read', 'benefits.write', 'benefits.delete', 'benefits.manage',
  'compliance.read', 'compliance.write', 'compliance.delete', 'compliance.manage',
  'iam.read', 'iam.write', 'iam.delete', 'iam.manage',
  'analytics.read', 'analytics.manage',
  'settings.read', 'settings.write', 'settings.manage',
  'companies.read', 'companies.write', 'companies.delete', 'companies.manage',
  'super_admin.manage',
];
```

#### 3.9 — Add `@RequirePermissions` decorator

```typescript
// src/common/decorators/permissions.decorator.ts
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

#### 3.10 — Fix existing controllers to use guards

Once JwtAuthGuard is global, mark public routes with `@Public()`:
```typescript
// auth.controller.ts
@Public()
@Post('login')
login() {}

@Public()
@Post('register-workspace')
registerWorkspace() {}
```

Add `@RequirePermissions()` to IAM and Company endpoints:
```typescript
// iam.controller.ts
@RequirePermissions('iam.read')
@Get('users')
getUsers() {}

@RequirePermissions('iam.manage')
@Delete('users/:id')
deleteUser() {}

// company.controller.ts
@RequirePermissions('settings.read')
@Get('settings/:companyId')
getSettings() {}
```

**CRITICAL TEST — write before shipping Phase 3:**
```typescript
it('unauthenticated request returns 401', async () => {
  const res = await request(app).get('/api/v1/iam/users');
  expect(res.status).toBe(401);
});

it('authenticated user without permission returns 403', async () => {
  const token = await loginAs('employee');
  const res = await request(app)
    .delete('/api/v1/iam/users/some-id')
    .set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(403);
});

it('Company A user cannot read Company B employees', async () => {
  const tokenA = await loginAs(companyAAdmin);
  const res = await request(app)
    .get('/api/v1/employees')
    .set('Authorization', `Bearer ${tokenA}`);
  expect(res.body.data).not.toContain(companyBEmployee);
});
```

**Phase 3 Checklist:**
- [ ] Create `@Public()` decorator
- [ ] Create `@CurrentUser()` decorator
- [ ] Create `@RequirePermissions()` decorator
- [ ] Build `JwtAuthGuard`
- [ ] Build `GlobalAdminGuard`
- [ ] Build `PermissionsGuard` (NEVER comment this out)
- [ ] Build `StatusGuard` (with Redis cache, NOT raw DB per request)
- [ ] Build `tenantStorage` (AsyncLocalStorage)
- [ ] Build `TenantScopeMiddleware`
- [ ] Add Prisma RLS middleware to PrismaService constructor
- [ ] Wire all guards globally in `AppModule`
- [ ] Build `BootstrapService` (seed super admin + permissions on startup)
- [ ] Mark all public auth routes with `@Public()`
- [ ] Add `@RequirePermissions()` to all existing IAM and Company endpoints
- [ ] Write cross-company isolation integration test
- [ ] Write unauthenticated access test

---

### Phase 4 — Super Admin Module (Week 4–5)

> **Current state:** None. No super-admin module exists.
> Prerequisite: Phase 3 must be complete and tested.

All `/super-admin/*` routes:
- `JwtAuthGuard` (via global)
- `GlobalAdminGuard` (via global — blocks isImpersonating)
- `PermissionsGuard` with `@RequirePermissions('companies.manage')`

#### Company lifecycle (create with full seeding)

On `POST /super-admin/companies`, run a DB transaction:
```
1. company.create()
2. companySettings.create()       ← Tanzania defaults (TZS, Africa/Dar_es_Salaam)
3. role.create({ scope: TENANT }) ← COMPANY_ADMIN role
4. seed all permissions → role
5. user.upsert({ email: adminEmail })
6. userRole.create()
7. leaveType.createMany()         ← Tanzania statutory defaults
8. payeBracket.createMany()       ← Current TRA brackets
9. plan.seed()                    ← Link to selected plan
```

Tanzania statutory leave defaults:
```typescript
const TANZANIA_LEAVE_DEFAULTS = [
  { name: 'Annual Leave',     code: 'AL', daysPerYear: 28,  isPaid: true,  gender: null },
  { name: 'Sick Leave',       code: 'SL', daysPerYear: 126, isPaid: true,  gender: null },
  { name: 'Maternity Leave',  code: 'ML', daysPerYear: 84,  isPaid: true,  gender: 'FEMALE' },
  { name: 'Paternity Leave',  code: 'PL', daysPerYear: 3,   isPaid: true,  gender: 'MALE' },
  { name: 'Compassionate',    code: 'CL', daysPerYear: 3,   isPaid: true,  gender: null },
];
```

Tanzania PAYE brackets (2025/26 TRA rates — verify and update each June):
```typescript
const PAYE_BRACKETS_2026 = [
  { fromAmount: 0,       toAmount: 270000,  rate: 0,    fixedAmount: 0 },
  { fromAmount: 270001,  toAmount: 520000,  rate: 0.08, fixedAmount: 0 },
  { fromAmount: 520001,  toAmount: 760000,  rate: 0.20, fixedAmount: 20000 },
  { fromAmount: 760001,  toAmount: 1000000, rate: 0.25, fixedAmount: 68000 },
  { fromAmount: 1000001, toAmount: null,    rate: 0.30, fixedAmount: 128000 },
];
```

#### Impersonation

```typescript
// POST /admin/impersonate
// Body: { targetCompanyId: string }
// Guards: JwtAuthGuard + PermissionsGuard('companies.manage')
// Rate limit: 10/min per user

async exchangeImpersonationToken(targetCompanyId: string, superAdmin: JwtPayload) {
  const company = await this.prisma.company.findUnique({
    where: { id: targetCompanyId, status: 'ACTIVE' },
  });
  if (!company) throw new NotFoundException('Company not found or not active');

  const role = await this.prisma.role.findFirst({
    where: { companyId: targetCompanyId, name: 'COMPANY_ADMIN' },
    include: { permissions: { include: { permission: true } } },
  });

  const permissions = role.permissions
    .map((rp) => rp.permission.name)
    .filter((p) => !p.startsWith('super_admin') && !p.startsWith('companies'));

  const jti = randomUUID();
  const token = this.jwt.sign({
    sub: superAdmin.sub,
    email: superAdmin.email,
    roles: [{ roleId: role.id, roleName: 'COMPANY_ADMIN', scope: 'TENANT', companyId: targetCompanyId }],
    permissions,
    selectedCompanyId: targetCompanyId,
    isSuperAdmin: false,
    isImpersonating: true,
    originalAdminId: superAdmin.sub,
    jti,
  }, { expiresIn: '1h' });

  await this.prisma.impersonationAudit.create({
    data: { superAdminId: superAdmin.sub, targetCompanyId, expiresAt: new Date(Date.now() + 3600_000) },
  });

  return { impersonationToken: token, company: { id: company.id, name: company.name } };
}
```

#### Super admin endpoint table

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | /super-admin/dashboard | companies.manage | Cache 5 min in Redis |
| GET | /super-admin/companies | companies.manage | `?status=&search=&page=&limit=` |
| POST | /super-admin/companies | companies.manage | Full seeding transaction |
| GET | /super-admin/companies/:id | companies.manage | Enriched with analytics |
| PUT | /super-admin/companies/:id | companies.manage | |
| PATCH | /super-admin/companies/:id/status | companies.manage | `{ status: ACTIVE/SUSPENDED }` reversible |
| PATCH | /super-admin/companies/:id/delete | companies.manage | Terminal soft delete |
| POST | /admin/impersonate | companies.manage | Rate limited: 10/min |
| GET | /super-admin/users | companies.manage | All platform users |
| POST | /super-admin/users/create-super-admin | super_admin.manage | |
| PATCH | /super-admin/users/:id/toggle-active | companies.manage | |
| DELETE | /super-admin/users/:id | companies.manage | Anonymize email |
| GET | /super-admin/audit-logs | super_admin.manage | Paginated, filterable |
| GET | /super-admin/subscriptions/overview | companies.manage | MRR, ARR, churn |
| GET | /super-admin/subscriptions/company-billing | companies.manage | |
| GET | /super-admin/subscriptions/invoices | companies.manage | |
| POST | /super-admin/subscriptions/:id/change-plan | companies.manage | |
| GET | /super-admin/security/sessions | super_admin.manage | From Redis |
| DELETE | /super-admin/security/sessions/:jti | super_admin.manage | Force revoke |
| GET | /super-admin/branding/:companyId | companies.manage | |
| PUT | /super-admin/branding/:companyId | companies.manage | |

**Phase 4 Checklist:**
- [ ] Create `src/super-admin/` module
- [ ] Implement company CRUD with full seeding transaction
- [ ] Implement impersonation endpoint with rate limiting
- [ ] Implement audit log query endpoint
- [ ] Implement dashboard stats (raw SQL, cached)
- [ ] Implement users management (list, toggle, delete, create super admin)
- [ ] Add stub subscription management endpoints (return real data from DB)
- [ ] Fix company status (add `PATCH /:id/status` separate from soft delete)
- [ ] Remove `CompanyService.create()` stub — it returns `{ id: 'new', ...data }` and must be replaced

---

### Phase 5 — Company Admin Module (Week 5–7)

> **Current state:** Company CRUD partially real, no auth enforcement.
> Settings upsert works. Branches/departments list works.
> CompanyService has stub methods that are bypassed by the controller calling Prisma directly.

**Fix company module structure:**
- Remove direct `prisma.*` calls from controller — move all to service
- Fix `CompanyService.create()` to actually hit the DB
- Add `@RequirePermissions()` to all endpoints
- Add file upload to S3 (not local disk)

| Method | Path | Permission | Current | Action |
|---|---|---|---|---|
| GET | /company/dashboard | settings.read | ❌ Missing | Add |
| GET | /company/settings/:id | settings.read | ✅ Real DB | Add guard |
| PUT | /company/settings/:id | settings.manage | ✅ Real DB | Add guard |
| POST | /company/logo | settings.manage | ⚠️ Local disk | Move to S3 |
| GET | /company/branches | iam.read | ✅ Real DB | Add guard, pagination |
| POST | /company/branches | iam.write | ❌ Missing | Add |
| PUT | /company/branches/:id | iam.write | ❌ Missing | Add |
| GET | /company/departments | iam.read | ✅ Real DB | Add guard, pagination |
| POST | /company/departments | iam.write | ❌ Missing | Add |
| PUT | /company/departments/:id | iam.write | ❌ Missing | Add |
| GET | /company/job-titles | iam.read | ❌ Missing | Add |
| POST | /company/job-titles | iam.write | ❌ Missing | Add |
| GET | /company/pay-grades | iam.read | ❌ Missing | Add |
| POST | /company/pay-grades | iam.write | ❌ Missing | Add |

**IAM sub-module (user management within a company):**

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | /iam/users | iam.read | Filter by companyId via RLS |
| POST | /iam/users/invite | iam.manage | Create user (inactive) + send OTP invite |
| PATCH | /iam/users/:id/roles | iam.manage | Update role assignments |
| PATCH | /iam/users/:id/activate | iam.manage | |
| PATCH | /iam/users/:id/deactivate | iam.manage | |
| GET | /iam/roles | iam.read | Roles for this company |
| POST | /iam/roles | iam.manage | Custom role |
| PUT | /iam/roles/:id/permissions | iam.manage | |

**Phase 5 Checklist:**
- [ ] Fix `CompanyService` — remove all stub methods, implement real logic
- [ ] Move direct Prisma calls from controller into service layer
- [ ] Add `@RequirePermissions()` to all company endpoints
- [ ] Add full company dashboard stats endpoint
- [ ] Add Branch CRUD (currently only GET list)
- [ ] Add Department CRUD (currently only GET list)
- [ ] Add JobTitle CRUD
- [ ] Add PayGrade CRUD
- [ ] Move file upload from local disk to S3
- [ ] Add IAM sub-module (invite, roles, activate/deactivate)

---

### Phase 6 — Employee Module (Week 6–9)

> **Current state:** No Employee model, no employee endpoints.
> User model has `employeeId` nullable string but no FK.

**Employee number generation:**
```typescript
async generateEmployeeNumber(companyId: string, tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.employee.count({ where: { companyId } });
  return `EMP-${year}-${String(count + 1).padStart(4, '0')}`;
}
```

**Employee lifecycle state machine:**
```
HIRED → ACTIVE → ON_LEAVE → ACTIVE
              → SUSPENDED → ACTIVE
              → TERMINATED (terminal)
```

Each state transition:
1. Validate preconditions
2. Update employee status
3. Write audit log (before/after snapshot)
4. Emit event
5. Notify relevant parties

**Full-text search (PostgreSQL):**
```sql
-- Add to migration:
CREATE INDEX employees_search_idx ON employees
USING GIN (to_tsvector('english', first_name || ' ' || last_name || ' ' || employee_number));
```

**Endpoint table:**

| Method | Path | Permission |
|---|---|---|
| GET | /employees | employees.read |
| POST | /employees | employees.write |
| GET | /employees/:id | employees.read |
| PUT | /employees/:id | employees.write |
| GET | /employees/org-chart | employees.read |
| POST | /employees/:id/confirm | employees.manage |
| POST | /employees/:id/transfer | employees.manage |
| POST | /employees/:id/promote | employees.manage |
| POST | /employees/:id/suspend | employees.manage |
| POST | /employees/:id/terminate | employees.manage |
| POST | /employees/:id/documents | employees.write |
| GET | /employees/:id/documents | employees.read |
| DELETE | /employees/:id/documents/:docId | employees.delete |

---

### Phase 7 — Attendance (Week 9–10)

> **Current state:** None.

| Method | Path | Permission | Notes |
|---|---|---|---|
| POST | /attendance/clock-in | attendance.write | Validates shift, detects late |
| POST | /attendance/clock-out | attendance.write | Calculates hours |
| GET | /attendance | attendance.read | Filter by employee, date range, status |
| POST | /attendance/biometric-webhook | N/A | `X-Device-Token` auth, idempotent |
| GET | /attendance/report | attendance.read | Aggregated stats |
| POST | /attendance/manual | attendance.manage | HR manual correction, audit logged |
| GET | /attendance/shifts | attendance.read | |
| POST | /attendance/shifts | attendance.manage | |
| POST | /attendance/shifts/:id/assign | attendance.manage | |

---

### Phase 8 — Leave Management (Week 10–11)

> **Current state:** None.

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | /leave/types | leave.read | |
| POST | /leave/types | leave.manage | |
| PUT | /leave/types/:id | leave.manage | |
| GET | /leave/balances | leave.read | `?employeeId=&year=` |
| POST | /leave/requests | leave.write | Validates balance, checks conflicts |
| GET | /leave/requests | leave.read | `?status=&from=&to=&employeeId=` |
| PATCH | /leave/requests/:id/approve | leave.manage | Balance update with row lock |
| PATCH | /leave/requests/:id/reject | leave.manage | |
| PATCH | /leave/requests/:id/cancel | leave.write | Employee can cancel PENDING only |
| GET | /leave/calendar | leave.read | `?month=` |

**Critical — balance update must use DB transaction with row lock:**
```typescript
await this.prisma.$transaction(async (tx) => {
  const balance = await tx.leaveBalance.findFirst({
    where: { employeeId, leaveTypeId, year },
  });
  if (balance.allocated - balance.used - balance.pending < request.days) {
    throw new BadRequestException('INSUFFICIENT_LEAVE_BALANCE');
  }
  await tx.leaveBalance.update({
    where: { id: balance.id },
    data: { pending: { increment: request.days } },
  });
  await tx.leaveRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED', approverId, approvedAt: new Date() },
  });
});
```

---

### Phase 9 — Payroll (Week 12–15)

> **Current state:** None.
> **This is the most complex module. Tanzania statutory rates change each June (TRA budget).**

**Calculation engines — pure functions, no DB, fully unit-tested:**

```typescript
// src/payroll/engines/paye.engine.ts
export function calculatePaye(monthlyGross: number, brackets: PayeBracket[]): PayeResult {
  const annual = monthlyGross * 12;
  let tax = 0;
  const sorted = [...brackets].sort((a, b) => a.fromAmount - b.fromAmount);

  for (const bracket of sorted) {
    if (annual <= bracket.fromAmount) break;
    const upper = bracket.toAmount ?? Infinity;
    const taxable = Math.min(annual, upper) - bracket.fromAmount;
    if (taxable <= 0) continue;
    tax += bracket.fixedAmount + taxable * bracket.rate;
    if (!bracket.toAmount) break;
  }

  return {
    annualPaye: tax,
    monthlyPaye: tax / 12,
    effectiveRate: annual > 0 ? tax / annual : 0,
  };
}

// src/payroll/engines/nssf.engine.ts
export function calculateNssf(grossSalary: number): NssfResult {
  const EMPLOYEE_RATE = 0.10;
  const EMPLOYER_RATE = 0.10;
  // Verify cap against current NSSF Act before each budget cycle
  const CAP_COMBINED = 500_000;
  const combined = Math.min(grossSalary * (EMPLOYEE_RATE + EMPLOYER_RATE), CAP_COMBINED);
  const ratio = EMPLOYEE_RATE / (EMPLOYEE_RATE + EMPLOYER_RATE);
  return {
    employeeContribution: combined * ratio,
    employerContribution: combined * (1 - ratio),
  };
}

// src/payroll/engines/sdl.engine.ts
export function calculateSdl(grossPayroll: number): number {
  return grossPayroll * 0.045;  // 4.5% — verify with TRA each year
}

// src/payroll/engines/wcf.engine.ts
export function calculateWcf(grossPayroll: number): number {
  return grossPayroll * 0.005;  // 0.5% employer-only
}
```

**Rate update process (every June after TRA budget):**
1. Update `paye_brackets` in DB via super admin panel
2. Run unit tests with known salary amounts to verify
3. Deploy — no code change needed if brackets are in DB

**Payroll run flow (BullMQ — NEVER run inline in request cycle):**
```
POST /payroll/runs              → create DRAFT → return { runId }
POST /payroll/runs/:id/process  → enqueue BullMQ job → return { jobId }
GET  /payroll/jobs/:jobId       → poll: PENDING | PROCESSING | COMPLETED | FAILED
POST /payroll/runs/:id/approve  → APPROVED → trigger disbursement notifications
GET  /payroll/runs/:id/slips    → list slips (after COMPLETED)
GET  /payroll/runs/:id/slips/:employeeId → individual payslip
POST /payroll/runs/:id/export   → queue export job → { jobId }
```

**Job processor:**
```typescript
@Processor('payroll')
export class PayrollProcessor {
  @Process('run')
  async processRun(job: Job<{ runId: string; companyId: string }>) {
    const { runId, companyId } = job.data;
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: { grade: true },
    });
    const brackets = await this.getPayeBrackets(companyId);  // cached in Redis 1h

    const slips = [];
    for (const emp of employees) {
      const grossSalary = emp.grade?.minSalary ?? 0;
      const paye = calculatePaye(Number(grossSalary), brackets);
      const nssf = calculateNssf(Number(grossSalary));
      const sdl = calculateSdl(Number(grossSalary));
      const wcf = calculateWcf(Number(grossSalary));
      slips.push({ /* PayrollSlip fields */ });
    }

    await this.prisma.$transaction([
      this.prisma.payrollSlip.createMany({ data: slips }),
      this.prisma.payrollRun.update({
        where: { id: runId },
        data: { status: 'COMPLETED', processedAt: new Date(), /* totals */ },
      }),
    ]);
  }
}
```

**Export generates (via separate queue job, uploads to S3):**
- Individual payslips PDF per employee
- Bank disbursement CSV (CRDB/NMB/ABSA Tanzania format)
- NSSF contribution schedule
- PAYE remittance schedule (TRA format)
- SDL/WCF schedules

---

### Phase 10 — Performance, Training, Contracts, Benefits, Compliance (Week 15–20)

Standard CRUD + state machine per module.

**Performance review state machine:**
```
PENDING → SELF_ASSESSED → MANAGER_REVIEWED → CALIBRATED → CLOSED
```

**Training — certificate generation:**
- Use `pdf-lib` to fill PDF template
- Upload to S3, store URL in `training_certificates`

**Contracts — expiry cron job:**
```typescript
@Cron('0 8 * * *')  // 08:00 daily
async checkExpiringContracts() {
  const in30Days = new Date(Date.now() + 30 * 24 * 3600_000);
  const expiring = await this.prisma.contract.findMany({
    where: { endDate: { lte: in30Days, gt: new Date() }, status: 'ACTIVE' },
  });
  for (const contract of expiring) {
    this.eventEmitter.emit('contract.expiring_soon', contract);
  }
}
```

---

### Phase 11 — Notifications (Week 20–21)

> **Current state:** None.

**Event-driven via `@nestjs/event-emitter`:**

| Event | Channels | Recipients |
|---|---|---|
| employee.created | EMAIL | Employee (welcome + login) |
| leave.approved | EMAIL, SMS | Employee |
| leave.rejected | EMAIL | Employee |
| payroll.completed | IN_APP, EMAIL | Employee (payslip ready) |
| contract.expiring_soon | EMAIL, IN_APP | HR Manager, Employee |
| performance.review_due | EMAIL, IN_APP | Employee, Manager |
| subscription.expiring_soon | EMAIL | Company Admin, Super Admin |

**Template system:** Handlebars templates in `notification_templates` DB table.
Company-level override with global fallback.

---

### Phase 12 — Analytics & Reporting (Week 21–23)

> **Current state:** Subscriptions module has some hardcoded stats.
> AI module exists. Raw DB aggregates via raw SQL.

All heavy reports (employee export, annual payroll, attendance year) must be queued as BullMQ jobs.
Generate → upload to S3 → return pre-signed URL (1h expiry).
Never stream large files through NestJS.

---

### Phase 13 — AI & Integrations (Week 23+)

> **Current state:** `POST /ai/chat` exists and calls OpenAI GPT-4o-mini.
> No auth enforcement. `---CONFIRM---` protocol partially implemented.
> ConfirmData extracted but never persisted to DB.

**Fix AI module:**
1. Add `JwtAuthGuard` (remove `@Public()` if it has one)
2. Add throttling: 10 req/min per user on AI endpoint
3. Wire `confirmData` actions to real service calls
4. Inject tenant context into system prompt

**Integration provider interface:**
```typescript
interface IntegrationProvider {
  provider: string;
  testConnection(): Promise<{ ok: boolean; latencyMs: number }>;
  submitFiling(data: FilingData): Promise<{ ref: string; status: string }>;
  getFilingStatus(ref: string): Promise<FilingStatus>;
}
```

---

### Phase 14 — Frontend Integration (Parallel with Phases 4–13)

**Priority fixes in frontend (from analysis):**

**1. Fix role name mapping in `auth.service.js` (CRITICAL):**
```javascript
// Current: maps "System Administrator" → /admin/overview
// Backend creates role name: "HRM_SUPER_ADMIN"
// Result: super admin is routed to /portal/home instead of /admin/overview

// Fix:
const ROLE_TO_APP = {
  "HRM_SUPER_ADMIN": { app: "admin", homePath: "/admin/overview", managementAccess: false },
  "COMPANY_ADMIN":   { app: "dashboard", homePath: "/dashboard/overview", managementAccess: false },
  // ... existing mappings
};
```

**2. Wire impersonation in `CompanyDetail.jsx`:**
```javascript
// Current: navigate('/dashboard/overview') — no API call
// Fix:
async function handleViewInDashboard(companyId) {
  const result = await apiFetch('/admin/impersonate', {
    method: 'POST',
    body: JSON.stringify({ targetCompanyId: companyId }),
  });
  sessionStorage.setItem('impersonation_token', JSON.stringify({
    token: result.impersonationToken,
    companyId,
    expiresAt: Date.now() + 3_600_000,
  }));
  navigate('/dashboard/overview');
}
```

**3. Create base API fetcher with token refresh:**
```javascript
// src/services/api.service.js
export async function apiFetch(path, options = {}, useImpersonation = false) {
  let res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...authHeaders(useImpersonation), ...options.headers },
  });
  if (res.status === 401 && !useImpersonation) {
    await refreshAccessToken();
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...options.headers },
    });
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  return (await res.json()).data;
}
```

---

## Part 4 — Audit Trail Design

**AuditInterceptor — global on all POST/PUT/PATCH/DELETE:**

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  async intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next.handle();

    return next.handle().pipe(
      tap(async (after) => {
        await this.prisma.auditLog.create({
          data: {
            companyId: user?.selectedCompanyId,
            actorId: user?.sub,
            actorType: 'USER',
            originalActorId: user?.originalAdminId,  // set during impersonation
            action: this.resolveAction(req),          // "employees.create"
            resource: this.resolveResource(req),      // "Employee"
            resourceId: after?.id ?? req.params.id,
            before: this.mask(req.body),
            after: this.mask(after),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestId: req.headers['x-request-id'],
          },
        });
      }),
    );
  }
}
```

**Fields to mask:**
- `password`, `codeHash`, `mfaSecret` → `[REDACTED]`
- `bankAccountNumber` → `****${last4}`
- `nationalId`, `tin` → `****${last3}`
- `credentials` (integration configs) → `[ENCRYPTED]`

---

## Part 5 — Security Checklist

### Authentication
- [ ] RS256 JWT signing (no HS256)
- [ ] 15-minute access token expiry (currently 7 days 🔴)
- [ ] Refresh token rotation via Redis JTI
- [ ] Token reuse detection → revoke all sessions
- [ ] OTP: bcrypt hash, 10-minute TTL, 6-digit
- [ ] Account lockout: 5 failed attempts → 15-minute cooldown (fields exist, logic missing ⚠️)
- [ ] No hardcoded secret fallbacks anywhere (currently: `'ehrm-super-secret-key-2026'` 🔴)
- [ ] No default passwords (currently: `'demo1234'` 🔴)

### Authorization
- [ ] JwtAuthGuard global (no endpoint is accidentally public)
- [ ] PermissionsGuard enabled and tested (NEVER comment out)
- [ ] GlobalAdminGuard on /super-admin/* routes
- [ ] Impersonation token strips super_admin.* permissions
- [ ] Tenant isolation verified by cross-company integration test
- [ ] StatusGuard: TERMINATED employees cannot access any endpoint

### Input/Output
- [ ] ValidationPipe: `whitelist: true, forbidNonWhitelisted: true` (currently false 🔴)
- [ ] All DTOs have @IsEmail(), @IsNotEmpty(), @MinLength() etc. (currently none 🔴)
- [ ] No raw SQL string concatenation
- [ ] File uploads: MIME type from binary header (not extension)
- [ ] File size limits: 5MB documents, 1MB logos
- [ ] No stack traces in production error responses
- [ ] CORS: whitelist from env, not `origin: '*'` (currently wildcard 🔴)

### Infrastructure
- [ ] Helmet enabled
- [ ] Rate limiting on auth: 5/10min per contact
- [ ] Rate limiting on impersonate: 10/min per user
- [ ] Integration credentials: AES-256-GCM encrypted
- [ ] JWT private key: env var only, never committed
- [ ] `grep -r 'secret\|password\|key' src/ --include="*.ts"` — no hardcoded values

---

## Part 6 — Performance Guidelines

### Caching (Redis)

| Cache key | TTL | Invalidated when |
|---|---|---|
| `user:permissions:{userId}:{companyId}` | 5 min | Role assignment changes |
| `company:settings:{companyId}` | 15 min | Settings updated |
| `employee:status:{userId}` | 5 min | Employee status changes |
| `dashboard:stats:{companyId}` | 5 min | Any data changes |
| `payroll:brackets:{companyId}:{year}` | 60 min | Brackets updated |
| `super-admin:dashboard` | 5 min | Any company/user changes |

### Background Jobs (BullMQ)

Operations that must NOT run inline in the request cycle:
- Payroll processing (`payroll` queue)
- Report/export generation (`reports` queue)
- Bulk notifications (`notifications` queue)
- Statutory filing submissions (`integrations` queue)

Pattern: `POST → { jobId }` then `GET /jobs/:jobId` to poll.

---

## Part 7 — Testing Strategy

### No database mocks
Use real PostgreSQL and Redis via Docker/testcontainers in all tests.
Mocking the DB masks real bugs.

### Critical tests (write before shipping each phase)

**Phase 0:** `GET /health` returns 200, invalid env vars crash app at boot

**Phase 3 (must pass before any tenant module ships):**
```typescript
it('unauthenticated request returns 401')
it('authenticated without permission returns 403')
it('Company A user cannot read Company B data')
it('impersonated user cannot access /super-admin routes')
```

**Phase 9 (payroll — write before wiring to DB):**
```typescript
it('PAYE is 0 for income <= TZS 270,000/month')
it('PAYE matches TRA table for TZS 500,000/month')
it('NSSF does not exceed statutory cap')
it('payroll run cannot process same month twice')
```

---

## Part 8 — Environment Configuration

```env
NODE_ENV=development
PORT=3000
GATEWAY_PORT=3000

# PostgreSQL
DATABASE_URL=postgresql://ehrm:password@localhost:5432/ehrm_db?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# JWT RS256 (generate with openssl — see Part 1 §2)
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=7

# Bootstrap
HRM_SUPER_ADMIN_EMAIL=admin@exactehrm.com

# Security
ALLOWED_ORIGINS=http://localhost:5173,https://app.exactehrm.com
ENCRYPTION_KEY=32-char-random-string-for-aes-256

# S3
S3_BUCKET=ehrm-documents
S3_REGION=af-south-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# AI
OPENAI_API_KEY=sk-...

# Notifications
SENDGRID_API_KEY=SG....
AT_API_KEY=...
AT_USERNAME=...

# Rate limits (req/min)
THROTTLE_AUTH_LIMIT=5
THROTTLE_IMPERSONATE_LIMIT=10
THROTTLE_GENERAL_LIMIT=100
```

---

## Part 9 — Implementation Order & Status

| Phase | Weeks | Deliverable | Status |
|---|---|---|---|
| **0** | Now | Foundation fixes (main.ts, guards, filters, interceptors) | 🔴 Not started |
| **1** | 1–2 | Schema migration to PostgreSQL + all new models | 🔴 Not started |
| **2** | 2–3 | Auth rebuild (RS256, 15min tokens, OTP, refresh via Redis) | ⚠️ 30% done |
| **3** | 3 | RBAC + tenant isolation + bootstrap service | ❌ Not started |
| **4** | 4–5 | Super admin module + impersonation | ❌ Not started |
| **5** | 5–7 | Company admin: fix existing + IAM + org structure | ⚠️ 20% done |
| **6** | 6–9 | Employee module (separate from User) | ❌ Not started |
| **7** | 9–10 | Attendance | ❌ Not started |
| **8** | 10–11 | Leave management | ❌ Not started |
| **9** | 12–15 | Payroll (BullMQ, calculation engines, statutory compliance) | ❌ Not started |
| **10** | 15–20 | Performance, Training, Contracts, Benefits, Compliance | ❌ Not started |
| **11** | 20–21 | Notifications (email, SMS, in-app) | ❌ Not started |
| **12** | 21–23 | Analytics + report exports | ❌ Not started |
| **13** | 23+ | AI fix + government integrations | ⚠️ AI 40% done |
| **14** | Parallel | Frontend wiring (starts after Phase 4 exists) | ⚠️ Shell only |

---

## Known Risks

| Risk | Severity | Status | Mitigation |
|---|---|---|---|
| All 24 endpoints effectively public (no guards) | 🔴 CRITICAL | Unfixed | Phase 3 — FIRST |
| JWT 7d access token — can't revoke in time | 🔴 CRITICAL | Unfixed | Phase 2 — 15min tokens |
| Hardcoded JWT secret fallback | 🔴 CRITICAL | Unfixed | Phase 0 — remove fallback |
| `whitelist: false` — extra fields pass through | 🔴 HIGH | Unfixed | Phase 0 — fix main.ts |
| CORS `origin: '*'` | 🔴 HIGH | Unfixed | Phase 0 — fix main.ts |
| Tanzania PAYE brackets change each June | HIGH | Ongoing | Store in DB, not code |
| Payroll blocking web server if run inline | HIGH | N/A yet | BullMQ from day one |
| PermissionsGuard gets commented out (ehrm_backend lesson) | HIGH | N/A yet | Smoke test in CI |
| Tenant isolation bug | CRITICAL | N/A yet | Cross-company test must pass before any module ships |
| CompanyService stubs (returns mock data) | MEDIUM | Unfixed | Phase 5 |
| AI endpoint unprotected (burns OpenAI quota) | MEDIUM | Unfixed | Phase 0 — add JwtAuthGuard |
| Local disk file storage (not S3) | MEDIUM | Unfixed | Phase 5 |
| No error handling on most service methods | MEDIUM | Unfixed | GlobalExceptionFilter (Phase 0) |

---

*Internal document — do not commit. See .gitignore.*
