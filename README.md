# ExactEHRM Backend - Microservices Architecture

A complete microservices-based HRM (Human Resource Management) backend built with **NestJS**, **gRPC**, **Prisma**, and **MySQL**.

## Architecture Overview

```
                    ┌──────────────────┐
                    │   API Gateway    │ :3000
                    │  (REST + Swagger)│
                    └────────┬─────────┘
                             │ gRPC
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │   IAM   │         │ Company │         │Employee │
   │  :5001  │         │  :5002  │         │  :5003  │
   └────┬────┘         └─────────┘         └────┬────┘
        │                                      │
        └──────────── 25 services ─────────────┘
```

## 25 Microservices

| # | Service | Port | Description |
|---|---------|------|-------------|
| 1 | **IAM** | 5001 | Identity & Access Management (Auth, Users, Roles, Permissions) |
| 2 | **Company** | 5002 | Companies, Branches, Departments, Settings |
| 3 | **Employee** | 5003 | Employee records, Documents, Qualifications, Emergency Contacts |
| 4 | **Attendance** | 5004 | Attendance, Shifts, Overtime, Geofencing, Exceptions |
| 5 | **Leave** | 5005 | Leave Requests, Types, Balances, Encashment, Calendar |
| 6 | **Payroll** | 5006 | Payroll Runs, Advances, Deductions, Allowances, Journal |
| 7 | **Performance** | 5007 | Reviews, Goals, KPIs |
| 8 | **Training** | 5008 | Training Programs, Enrollments, Certifications |
| 9 | **Onboarding** | 5009 | Employee Onboarding workflows |
| 10 | **Offboarding** | 5010 | Employee Offboarding workflows |
| 11 | **Movement** | 5011 | Transfers, Promotions |
| 12 | **Contracts** | 5012 | Contract management |
| 13 | **Assets** | 5013 | Asset tracking and assignments |
| 14 | **Benefits** | 5014 | Employee benefits management |
| 15 | **Disciplinary** | 5015 | Disciplinary cases and actions |
| 16 | **Compliance** | 5016 | Compliance requirements, Statutory filings |
| 17 | **Announcements** | 5017 | Company announcements |
| 18 | **Analytics** | 5018 | Dashboards, Headcount, Attendance, Leave, Payroll analytics |
| 19 | **Salary Intelligence** | 5019 | Salary benchmarking, Compensation analysis |
| 20 | **ExactAI** | 5020 | AI assistant, Employee summaries, Insights, Attrition prediction |
| 21 | **Notifications** | 5021 | System notifications |
| 22 | **Tasks** | 5022 | Task management |
| 23 | **HR Query** | 5023 | HR Q&A, FAQs, Support tickets |
| 24 | **Documents** | 5024 | Document management |
| 25 | **Integrations** | 5025 | Third-party integrations, Webhooks |

## Tech Stack

- **Framework**: NestJS 11 (Monorepo)
- **Communication**: gRPC (Protocol Buffers)
- **ORM**: Prisma 5
- **Database**: MySQL 8
- **Auth**: JWT (with phone AND email login)
- **API**: REST via API Gateway
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript

## Database Configuration

- **Host**: `localhost`
- **Port**: `3306`
- **User**: `root`
- **Password**: `` (empty)
- **Database naming**: `ehrm-[service-name]`
  - `ehrm-iam`, `ehrm-company`, `ehrm-employee`, etc.

## Quick Start

### 1. Prerequisites
- Node.js >= 18
- MySQL 8+
- npm

### 2. Install Dependencies
```bash
cd ehrm-new-backend
npm install --legacy-peer-deps
```

### 3. Create Databases
```bash
./scripts/create-databases.sh
```

### 4. Generate Prisma Clients & Push Schemas
```bash
./scripts/migrate.sh
```

### 5. Start All Services
```bash
./scripts/start-all.sh
```

### 6. Access the API

- **API Gateway**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/v1/health
- **Services List**: http://localhost:3000/api/v1/services

### 7. Stop All Services
```bash
./scripts/stop-all.sh
```

## Authentication

The IAM service supports **both email and phone login**:

### Email Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr.admin@acaciagroup.co.tz",
    "password": "demo1234"
  }'
```

### Phone Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login/phone \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+255712345678",
    "password": "demo1234"
  }'
```

### Using the Token
```bash
curl http://localhost:3000/api/v1/employee \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Swagger Documentation with Service Switching

The Swagger UI at **http://localhost:3000/api** provides:

- **Interactive API documentation** for all 25 microservices
- **Service filtering** - Use the tag selector at the top to switch between services
- **Try it out** - Test endpoints directly from the browser
- **JWT authentication** - Click "Authorize" to add your token
- **Request/Response schemas** - Auto-generated from TypeScript DTOs

### Available Tags for Service Switching:
- Authentication
- IAM - Users & Roles
- Company
- Employee
- Attendance
- Leave
- Payroll
- Performance
- Training
- Onboarding
- Offboarding
- Movement
- Contracts
- Assets
- Benefits
- Disciplinary
- Compliance
- Announcements
- Analytics
- Salary Intelligence
- ExactAI
- Notifications
- Tasks
- HR Query
- Documents
- Integrations

## Project Structure

```
ehrm-new-backend/
├── apps/                          # Microservices (NestJS monorepo)
│   ├── api-gateway/              # HTTP REST + Swagger
│   ├── iam-service/              # Authentication & Authorization
│   ├── company-service/          # Multi-tenant companies
│   ├── employee-service/         # Employee management
│   ├── attendance-service/       # Attendance tracking
│   ├── leave-service/            # Leave management
│   ├── payroll-service/          # Payroll processing
│   ├── performance-service/      # Performance reviews
│   ├── training-service/         # Training programs
│   ├── onboarding-service/       # Onboarding workflows
│   ├── offboarding-service/      # Offboarding workflows
│   ├── movement-service/         # Transfers & promotions
│   ├── contracts-service/        # Contract management
│   ├── assets-service/           # Asset tracking
│   ├── benefits-service/         # Benefits management
│   ├── disciplinary-service/     # Disciplinary cases
│   ├── compliance-service/       # Compliance & statutory
│   ├── announcements-service/    # Company announcements
│   ├── analytics-service/        # Analytics & dashboards
│   ├── salary-intelligence-service/# Salary benchmarking
│   ├── exactai-service/          # AI assistant
│   ├── notifications-service/    # Notifications
│   ├── tasks-service/            # Task management
│   ├── hr-query-service/         # HR Q&A
│   ├── documents-service/        # Document management
│   └── integrations-service/     # Third-party integrations
├── libs/                          # Shared libraries
│   └── common/                   # Common code (auth, prisma, grpc, filters)
├── proto/                         # Protocol Buffer definitions
│   ├── common.proto
│   ├── iam.proto
│   ├── company.proto
│   ├── employee.proto
│   ├── attendance.proto
│   ├── leave.proto
│   ├── payroll.proto
│   ├── performance.proto
│   ├── training.proto
│   ├── onboarding.proto
│   ├── offboarding.proto
│   ├── movement.proto
│   ├── contracts.proto
│   ├── assets.proto
│   ├── benefits.proto
│   ├── disciplinary.proto
│   ├── compliance.proto
│   ├── announcements.proto
│   ├── analytics.proto
│   ├── salary_intelligence.proto
│   ├── exactai.proto
│   ├── notifications.proto
│   ├── tasks.proto
│   ├── hrquery.proto
│   ├── documents.proto
│   └── integrations.proto
├── scripts/                       # Utility scripts
│   ├── create-databases.sh       # Create all MySQL databases
│   ├── migrate.sh                # Run Prisma migrations
│   ├── start-all.sh              # Start all services
│   └── stop-all.sh               # Stop all services
├── .env                           # Environment variables
├── nest-cli.json                  # NestJS monorepo config
├── package.json
└── README.md
```

## Running Individual Services

You can also run services individually during development:

```bash
# Development mode with watch
npm run start:gateway
npm run start:iam
npm run start:employee
npm run start:payroll
# etc.
```

## Environment Variables

All environment variables are in `.env`:

```env
NODE_ENV=development
JWT_SECRET=ehrm-super-secret-key-change-in-production-2026
GATEWAY_PORT=3000

# Each service has its own database URL
IAM_DATABASE_URL=mysql://root@localhost:3306/ehrm-iam
COMPANY_DATABASE_URL=mysql://root@localhost:3306/ehrm-company
# ... etc
```

## Features

✅ **25 Microservices** - Fully independent services
✅ **gRPC Communication** - Fast inter-service communication
✅ **Prisma + MySQL** - Type-safe ORM with 25 separate databases
✅ **REST API Gateway** - Single entry point for clients
✅ **Swagger UI** - Interactive API docs with service switching
✅ **JWT Authentication** - Secure token-based auth
✅ **Email + Phone Login** - Dual login support
✅ **Role-Based Access Control** - Granular permissions
✅ **Multi-tenant** - Company-scoped data
✅ **Audit Logging** - Track all auth events
✅ **TypeScript** - Full type safety
✅ **NestJS Monorepo** - Easy code sharing

## Default Demo Users

After running the seed script:
- `hr.admin@acaciagroup.co.tz` / `demo1234` (Company Admin)
- `employee@acaciagroup.co.tz` / `demo1234` (Employee)
- `manager@acaciagroup.co.tz` / `demo1234` (Line Manager)
- `payroll@acaciagroup.co.tz` / `demo1234` (Payroll Officer)
- `admin@exactehr.com` / `demo1234` (System Admin)

## License

UNLICENSED - Proprietary
