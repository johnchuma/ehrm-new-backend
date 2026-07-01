# Employee Portal — API Requirements (missing endpoints)

Spec for the genuinely-missing employee-portal endpoints, written to match this
codebase's existing conventions so they can be implemented directly.

> Scope note: This document covers **only the endpoints that do not exist yet**.
> Several things the portal analysis flagged as "missing" actually already exist
> and only need frontend wiring — see [Already built](#already-built-do-not-rebuild).

---

## Conventions (apply to every endpoint below)

- **Auth**: global `JwtAuthGuard`. Handlers take `@CurrentUser() user`, where
  `user.sub` is the userId. Resolve the employee via the standard helper
  (`getEmployeeByUserId`) — now that `User.employeeId` is populated this returns
  `{ employeeId, companyId }`.
- **Response envelope**: the global `ResponseInterceptor` wraps the handler's
  return value as `{ success: true, data: <return>, meta: { requestId, timestamp } }`.
  **The "Response" blocks below show the inner `data` only.**
- **Scoping**: every query is scoped to `employeeId` (self) or, for manager
  actions, to direct reports (`Employee.managerId = <my employeeId>`) — mirror
  the existing `/leave/team` + `PUT /leave/team/:id/approve` pattern.
- **Status strings**: plain strings, default `"PENDING"`, transitions to
  `"APPROVED"` / `"REJECTED"` / `"CANCELLED"` — consistent with `LeaveRequest`,
  `SalaryAdvance`.
- **IDs / timestamps**: `cuid()` ids, `createdAt`/`updatedAt` on every model.

---

## 0. Auth — surface roles & permissions  ⭐ PREREQUISITE FOR ALL GATING

**Verified current behavior (the blocker):** `/auth/login`, `/auth/me`, OTP-verify
and `/auth/refresh` all hardcode `roles: []` and `permissions: []`
(`auth.service.ts:55-56, 83, 104, 187`). `PermissionsGuard` reads
`user.permissions` from the JWT — always empty — so `@RequirePermissions` only
passes via the `isSuperAdmin` short-circuit, and it's used **only** in
`super-admin.controller.ts`. Employee creation sets only the `User.role` *string*;
**no `UserRole` row is created**, so a normal employee carries no linked
permissions at all. ⇒ The frontend has zero permission data to gate on today.

**Required backend changes:**

1. **Resolve permissions at token generation.** Read the user's
   `UserRole → Role → RolePermission → Permission` chain, dedupe to a
   `string[]` of `"module.action"`, and include it in both the JWT payload and
   the login/me response (replace the hardcoded `[]`).
2. **Populate `roles[]`** similarly: `[{ id, name, scope }]`.
3. **Assign a real `UserRole` on employee creation/invite** — link the seeded
   `Employee` tenant role — so non-admin users actually carry permissions.
4. **Add a manager signal.** Include `isManager` + `directReportsCount` (derive
   from `count(Employee where managerId = me)`) so the portal can gate MSS
   surfaces without guessing.
5. **Enforce guards** by adding `@RequirePermissions('leave.manage')` etc. to the
   team/admin approval routes once permissions are surfaced (otherwise gating is
   cosmetic).

**Target `GET /auth/me` response (`data`):**
```json
{
  "user": { "id": "...", "email": "...", "fullName": "...", "companyId": "...", "employeeId": "...", "role": "Employee" },
  "roles": [{ "id": "...", "name": "Line Manager", "scope": "TENANT" }],
  "permissions": ["leave.read", "leave.manage", "attendance.read"],
  "isManager": true,
  "directReportsCount": 3,
  "selectedCompanyId": "..."
}
```

> **Permission catalog** (from `permissions.seed.ts`): `"${module}.${action}"`,
> modules = `employees, attendance, leave, payroll, performance, training,
> contracts, benefits, compliance, iam, analytics, settings, companies`;
> actions = `read, write, delete, manage`; plus `super_admin.manage`.
> Note: `expenses`, `overtime`, `advances` are **not** in the catalog — add them
> if the new approval endpoints below should be permission-gated.

---

## 1. Performance summary — `GET /performance/me`

The home + performance modules expect an aggregate; today only
`/performance/me/reviews` and `/performance/me/goals` exist (no roll-up).

- **Method/Route**: `GET /performance/me`
- **Auth**: employee (self)
- **Request**: none
- **Logic**: aggregate the employee's active/latest review + goal progress, in
  the style of `dashboard.service`. No new model — reads existing
  `PerformanceReview` + `PerformanceGoal`.
- **Response (`data`)**:
```json
{
  "activeReview": {
    "id": "ckx...",
    "cycle": "2026 H1",
    "status": "SELF_REVIEW",
    "selfRating": 4,
    "managerRating": null,
    "overallRating": null,
    "period": { "start": "2026-01-01", "end": "2026-06-30" }
  },
  "goals": { "total": 5, "completed": 2, "inProgress": 2, "averageProgress": 58 },
  "latestRating": { "cycle": "2025 H2", "overallRating": 4.2 },
  "reviewsCount": 3
}
```
- **No data-model change.**

---

## 2. Notification preferences — `GET` / `PUT /notifications/me/preferences`

- **Routes**:
  - `GET /notifications/me/preferences` — fetch (return defaults if no row yet)
  - `PUT /notifications/me/preferences` — upsert
- **Auth**: employee (self, keyed by `userId`)
- **PUT request body**:
```json
{
  "email": true,
  "sms": false,
  "push": true,
  "digestFrequency": "DAILY",        // NONE | DAILY | WEEKLY
  "mutedCategories": ["TRAINING"]      // array of notification types to suppress
}
```
- **Response (`data`)**: the saved preferences object (same shape as body + `userId`, `updatedAt`).
- **New model**:
```prisma
model NotificationPreference {
  id              String   @id @default(cuid())
  userId          String   @unique
  email           Boolean  @default(true)
  sms             Boolean  @default(false)
  push            Boolean  @default(true)
  digestFrequency String   @default("DAILY") // NONE | DAILY | WEEKLY
  mutedCategories String?  @db.Text          // JSON array of category strings
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("notification_preferences")
}
```
- **Note**: `NotificationService.create()` should consult this row (skip muted
  categories / channels) when emitting — a follow-up wiring task.

---

## 3. Employee document self-upload — `POST` / `DELETE /employees/me/documents`

Today `GET /employees/me/documents` exists (read-only). Employees cannot upload
their own documents; only admin `POST /employees/:id/documents` exists.

- **Routes**:
  - `POST /employees/me/documents` — upload/attach a document to own record
  - `DELETE /employees/me/documents/:docId` — remove an own, employee-uploaded doc
- **Auth**: employee (self). DELETE must verify the doc belongs to the caller's
  `employeeId` **and** was self-uploaded (don't let employees delete
  HR-mandated/verified docs — gate on an `uploadedByEmployee` flag).
- **POST request** (`multipart/form-data` if storing files; or JSON if the
  frontend uploads to storage first and sends a URL):
```json
{
  "category": "ID",                 // ID | CONTRACT | CERTIFICATE | OTHER
  "name": "National ID",
  "fileUrl": "https://.../doc.pdf",  // if URL-based
  "mimeType": "application/pdf"
}
```
- **Response (`data`)**: the created `EmployeeDocument` row.
- **Reuses existing** `EmployeeDocument` model (already in schema) — add an
  `uploadedByEmployee Boolean @default(false)` column to distinguish self-uploads.
- **⚠️ Dependency / open question**: file storage strategy is undecided. Pick one
  before implementing — (a) multipart upload handled by the API to S3/local disk,
  or (b) frontend uploads to storage and posts only the resulting URL. The admin
  `POST /employees/:id/documents` path should be checked for an existing pattern
  to follow.

---

## 4. Attendance corrections — `GET` / `POST /attendance/me/corrections` (+ manager approve)

For employees to dispute/fix a wrong attendance record (missed checkout, wrong
status). No equivalent exists today; closest admin reference is
`attendance-admin` bulk-submissions (different shape — not reusable directly).

- **Routes**:
  - `POST /attendance/me/corrections` — raise a correction request
  - `GET /attendance/me/corrections` — list own corrections (`?status=`)
  - `GET /attendance/team/corrections` — manager: reports' pending corrections
  - `PUT /attendance/team/corrections/:id/approve` — manager: `{ action, comment }`;
    on approve, patch the underlying `Attendance` row.
- **POST request body**:
```json
{
  "date": "2026-06-20",
  "field": "checkOut",              // checkIn | checkOut | status
  "requestedValue": "2026-06-20T17:30:00Z",
  "reason": "Forgot to clock out"
}
```
- **Response (`data`)**: created correction (status `PENDING`).
- **New model**:
```prisma
model AttendanceCorrection {
  id              String   @id @default(cuid())
  employeeId      String
  companyId       String
  attendanceId    String?  // the record being corrected (may be null if missing)
  date            DateTime @db.Date
  field           String   // checkIn | checkOut | status
  requestedValue  String
  reason          String   @db.Text
  status          String   @default("PENDING") // PENDING | APPROVED | REJECTED
  approvedBy      String?
  approvedAt      DateTime?
  rejectionReason String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  @@index([employeeId])
  @@map("attendance_corrections")
}
```

---

## 5. Overtime requests — `GET` / `POST /attendance/me/overtime` (+ manager approve)

OT is currently only *computed* at checkout (`workMinutes − 480`) with no
request/approval flow.

- **Routes**:
  - `POST /attendance/me/overtime` — request OT for a date
  - `GET /attendance/me/overtime` — list own OT requests (`?status=`)
  - `GET /attendance/team/overtime` — manager: reports' pending OT
  - `PUT /attendance/team/overtime/:id/approve` — manager: `{ action, comment }`
- **POST request body**:
```json
{
  "date": "2026-06-25",
  "hours": 3,
  "reason": "Month-end closing"
}
```
- **Response (`data`)**: created OT request (status `PENDING`).
- **New model**:
```prisma
model OvertimeRequest {
  id              String   @id @default(cuid())
  employeeId      String
  companyId       String
  date            DateTime @db.Date
  hours           Decimal  @db.Decimal(5, 2)
  reason          String?  @db.Text
  status          String   @default("PENDING") // PENDING | APPROVED | REJECTED
  approvedBy      String?
  approvedAt      DateTime?
  rejectionReason String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  @@index([employeeId])
  @@map("overtime_requests")
}
```
- **Note**: on approval, decide whether approved hours feed payroll (link to
  `Attendance.overtime` / a payroll component) — **product decision**.

---

## 6. Leave encashment — `GET` / `POST /leave/me/encashment` (+ admin process)

Cash-out of unused leave days. No endpoint and no reference anywhere.

- **Routes**:
  - `POST /leave/me/encashment` — request to encash N days of a leave type
  - `GET /leave/me/encashment` — list own requests (`?status=`)
  - `POST /leave-admin/encashment/:id/respond` — HR: `{ action, reason }`
    (mirror `leave-admin/requests/:id/respond`); on approve, decrement the
    `LeaveBalance` and optionally raise a payroll adjustment.
- **POST request body**:
```json
{
  "leaveTypeId": "ckx...",
  "days": 5,
  "reason": "Annual cash-out"
}
```
- **Response (`data`)**: created encashment (status `PENDING`), with a computed
  `estimatedAmount` if salary is available.
- **New model**:
```prisma
model LeaveEncashment {
  id              String   @id @default(cuid())
  employeeId      String
  companyId       String
  leaveTypeId     String
  days            Decimal  @db.Decimal(8, 2)
  estimatedAmount Decimal? @db.Decimal(15, 2)
  reason          String?  @db.Text
  status          String   @default("PENDING") // PENDING | APPROVED | REJECTED | PAID
  approvedBy      String?
  approvedAt      DateTime?
  rejectionReason String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  employee  Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  leaveType LeaveType @relation(fields: [leaveTypeId], references: [id])
  @@index([employeeId])
  @@map("leave_encashments")
}
```
- **Validation**: requested `days` must not exceed available balance (reuse
  `leave.service` balance math); block overlap with pending leave applications —
  **confirm encashment policy with product** (which leave types are encashable,
  rate, caps).

---

## Already built (do NOT rebuild) — frontend wiring only

| Portal feature | Use this existing endpoint |
|---|---|
| Shift swaps | `POST /schedule/swap/request`, `GET /schedule/swap/me`, `PUT /schedule/swap/:id/respond` |
| Employee payroll | `GET /payroll/me/payslips`, `/me/payslips/:id`, `GET/POST /payroll/me/advances` |
| Performance reviews | `GET /performance/me/reviews`, `/me/reviews/:id`, `PUT /me/reviews/:id/self-review` |
| Document read | `GET /employees/me/documents` |
| Team attendance (view) | `GET /attendance/team` |
| Training catalog | `GET /training` |

---

## Cross-cutting prerequisite

**`User.employeeId` linkage** — fixed in code (`employee-crud.controller.ts`
now populates the reverse link on create/update). Existing rows need the
one-time backfill: `npx ts-node scripts/backfill-user-employee-link.ts`
(dry-run: 6 users link cleanly, 0 conflicts). Until this runs, all `/me`
endpoints 404 for already-created employees.

## Open product decisions (blockers for some of the above)

1. **Document storage** (§3) — API-handled multipart vs. URL-only.
2. **Overtime → payroll** (§5) — do approved OT hours flow to pay?
3. **Encashment policy** (§6) — encashable leave types, rate, caps.
4. **Approvals/MSS layer** — corrections & OT introduce manager-approval routes;
   these can stay per-module (as specced) or fold into the generic approval/
   workflow engine drafted separately. Decide before building the `/team/*` halves.
