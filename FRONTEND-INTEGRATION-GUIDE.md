# ExactEHRM — Frontend Integration Guide

Everything the frontend needs to build a fully integrated app against this backend:
conventions, the employee-portal endpoints, the RBAC/permissions model that drives
the management area, and integration recipes.

---

## 1. Conventions (read first)

**Base URL**

```
https://<host>/api/v1
```

Every path in this document is relative to that base (global prefix `api/v1`).

**Auth header** — all endpoints require a Bearer JWT unless marked _Public_:

```
Authorization: Bearer <accessToken>
```

**Success envelope** — every successful response is wrapped by a global interceptor:

```jsonc
{
  "success": true,
  "data": <the actual payload>,
  "meta": { "requestId": "…|null", "timestamp": "2026-07-01T10:00:00.000Z" }
}
```

> Always read `response.data` — the real payload is nested under `data`.

**Error envelope** — all errors share one shape:

```jsonc
{
  "success": false,
  "error": { "code": "BAD_REQUEST", "message": "A leave type is required" },
  "meta": { "requestId": null, "timestamp": "…", "path": "/api/v1/leave/me/apply" }
}
```

Codes: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404),
`CONFLICT` (409), `INTERNAL_ERROR` (500). Show `error.message` to the user.

**Auth lifecycle**
- Access token expires in **15 min**; refresh token in **7 days**.
- On any `401`, call `POST /auth/refresh` with the stored refresh token, retry once, else log out.
- `permissions` and `roles` are baked into the access token, so **after roles change the user must re-login (or refresh)** to see new access.

---

## 2. Auth & Session

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Email + password login |
| POST | `/auth/login/phone` | Public | Send OTP to a phone |
| POST | `/auth/login/phone/verify` | Public | Verify OTP → tokens |
| POST | `/auth/refresh` | Public | Exchange refresh token for a new pair |
| POST | `/auth/logout` | Bearer | Revoke all refresh tokens |
| GET | `/auth/me` | Public* | Validate token → `{ valid, user }` |
| GET | `/auth/me/permissions` | Bearer | Effective permissions for the nav (see §3) |
| POST | `/auth/switch-company` | Bearer | Switch active company (multi-company users) |
| POST | `/auth/forgot-password` | Public | Email a reset link |
| POST | `/auth/reset-password` | Public | Reset with token |
| POST | `/auth/confirm-email` | Public | Confirm email with token |
| POST | `/auth/resend-confirmation` | Public | Resend confirmation email |
| POST | `/auth/register-workspace` | Public | Self-serve company + admin signup |

**`POST /auth/login`** → `{ email, password }`
```jsonc
// data
{
  "accessToken": "jwt…",
  "refreshToken": "jwt…",
  "user": { "id","email","firstName","lastName","fullName","companyId","employeeId","role","isActive","emailVerified" }
}
```
Store both tokens. Use `user.employeeId` for the portal calls that take an employeeId.

**`POST /auth/refresh`** → `{ refreshToken }` → `{ accessToken, refreshToken }` (old refresh token is revoked — replace it).

**`POST /auth/switch-company`** → `{ companyId }` → new `{ accessToken, refreshToken, user, company, companies }`. Replace tokens; the new token is scoped to that company.

---

## 3. Permissions & the Management Area (RBAC)

Roles are **per-company and dynamic** (a company admin composes them). Permissions are a
**fixed catalog** of `resource.action` where `action ∈ {read, write, delete, manage}`.
Resources map 1:1 to management modules: `employees, attendance, leave, payroll,
performance, training, contracts, benefits, analytics, settings, compliance, iam`.

**`GET /auth/me/permissions`** — call once after login; build the whole management nav from it:
```jsonc
// data
{
  "isSuperAdmin": false,
  "isCompanyAdmin": true,
  "permissions": ["leave.read","leave.manage","payroll.read", …],
  "modules": { "leave": ["read","manage"], "payroll": ["read"], "attendance": ["read"] }
}
```

**How to gate the UI**
- Show a management module if `modules[resource]` exists (user holds any action on it).
- Within a module: `read` → view, `write` → create/edit buttons, `manage` → approve/config, `delete` → delete.
- Company Admin holds all 12 resources; a plain employee holds none (portal self-service only).

Management/admin endpoints are permission-gated server-side (see §10). A call the user
isn't entitled to returns `403 FORBIDDEN` — hide those controls proactively using the map above.

---

## 4. Profile

| Method | Path | Purpose |
|---|---|---|
| GET | `/employees/me` | Full own profile |
| PUT | `/employees/me` | Update own editable fields |
| GET | `/employees/me/documents` | Own documents (checklist + uploaded) |
| GET | `/employees/me/direct-reports` | Team list (for managers) |

**`GET /employees/me`** → full employee object (personal, job, department/branch, contract,
compensation, banking, emergency contact, `status`, `stage`).

**`PUT /employees/me`** — only these fields are accepted (everything else is server-locked):
`city, address, maritalStatus, emergencyName, emergencyPhone, emergencyRelation, bankName,
bankAccount, bankBranch, mobileMoney, mobileMoneyName, nationalId, tin, nssfNumber`.

---

## 5. Leave

Self-service plus reference-compatible aliases (both work; use whichever your UI prefers).

| Method | Path | Purpose |
|---|---|---|
| GET | `/leave/types` **or** `/leave/policy/categories` | Leave types/categories |
| GET | `/leave/me/balance` | My balances (current year) |
| GET | `/leave/balance/:employeeId` | My balances by id (self only; 403 otherwise) |
| GET | `/leave/me/applications?status=` **or** `/leave/requests?status=` | My requests |
| POST | `/leave/me/apply` **or** `/leave/requests` | Apply for leave |
| DELETE | `/leave/me/:id` **or** POST `/leave/requests/:id/cancel` | Cancel a pending request |
| GET | `/leave/team?status=` | Direct reports' requests (manager) |
| PUT | `/leave/team/:id/approve` | Manager approve/reject (routes through the one approval engine) |

**Apply** — body (accepts either `leaveTypeId` or the portal's `leaveCategoryId`):
```jsonc
{ "leaveCategoryId": "…", "startDate": "2026-08-01", "endDate": "2026-08-05",
  "reason": "…", "sickLeaveSubCategory": "PAID", "handoverNotes": "…" }
```
- `totalDays` is computed server-side (weekends excluded) — display it back.
- Errors you must surface: insufficient balance, overlapping dates, missing leave type.
- If approval is required, status starts `PENDING` and `pendingDays` is reserved on the balance.

**My applications** item includes: `status`, `approvalStage`, `approvedAt`, `rejectionReason`,
`leaveType`, and a resolved **`approver: { id, name }`** so you can show who acted.

**Balances** item: `{ totalDays, usedDays, pendingDays, carriedOver, leaveType{…} }`.
Available = `totalDays + carriedOver − usedDays − pendingDays`.

---

## 6. Attendance

| Method | Path | Purpose |
|---|---|---|
| GET | `/attendance/me/today` | Today's clock state |
| POST | `/attendance/me/checkin` **or** `/attendance/clock-in` | Clock in (accepts GPS) |
| POST | `/attendance/me/checkout` **or** `/attendance/clock-out/:employeeId` | Clock out (accepts GPS) |
| GET | `/attendance/clock-in/preflight/:employeeId` | Pre-clock-in check |
| GET | `/attendance/me?month=&year=` | My month summary + records |
| GET | `/attendance/time-history/:employeeId?year=&page=&limit=&startDate=&endDate=` | Paginated history + summary |
| GET | `/attendance/team?date=` | Team attendance for a date (manager) |
| POST | `/attendance/report/summary` | Team report over a range (manager) |

**Preflight** (call before showing the clock-in button):
```jsonc
// data
{ "hasClockedIn": false, "hasClockedOut": false, "attendanceId": null,
  "scheduledClockInTime": "08:00", "scheduledClockOutTime": "17:00",
  "geofenceRequired": true,
  "locations": [{ "id","name","latitude","longitude","radiusMeters","type" }] }
```

**Clock in/out** — body (GPS optional but recommended):
```jsonc
{ "latitude": -6.79, "longitude": 39.28, "source": "MOBILE", "notes": "…" }
```
- **Geofence:** if you send coordinates and the company has configured locations, the server
  rejects a clock-in outside every location's `radiusMeters` with `400` ("outside the allowed area").
  If you don't send coordinates, no geofence is enforced.
- Coordinates + `source` + computed `lateMinutes` are persisted on the record.

**Time-history** → `{ meta: { page, limit, total, totalPages, hasMore }, summary: { totalDays,
present, late, absent, onLeave, halfDay, totalWorkMinutes, totalOvertime }, records: [...] }`.
`:employeeId` must be the caller's own id (else `403`).

**Report summary** (manager) — body `{ startDate, endDate, departmentId?, userIds? }` →
`{ period, employees, summary: { totalRecords, present, late, absent, onLeave, halfDay,
totalWorkMinutes, totalOvertime, attendanceRate } }`. Defaults to the caller's direct reports.

> **Overtime → approval:** clocking out with overtime makes that record a pending OT approval
> that shows up in the approver's inbox (§8). Payroll only pays overtime once it's authorized.

---

## 7. Payslips & Advances (self-service)

| Method | Path | Purpose |
|---|---|---|
| GET | `/payroll/me/payslips?year=` | My payslips |
| GET | `/payroll/me/payslips/:id` | One payslip (full breakdown) |
| GET | `/payroll/me/advances` | My salary-advance history |
| POST | `/payroll/me/advances` | Request a salary advance |

Payslip fields: `month, year, basicSalary, grossSalary, totalAllowances, totalDeductions,
paye, nssf, wcf, sdl, netSalary, status, paidAt`. Detail parses `breakdown` JSON.
_(No PDF endpoint yet — render client-side from the detail payload.)_

---

## 8. Approvals (one unified workflow)

There is a **single** approval workflow. There is no separate approval record — a task is
addressed by a composite ref **`TYPE:recordId`** (e.g. `LEAVE:clx123`, `OVERTIME:clx999`).
Wired types today: **LEAVE** (multi-level, config-driven) and **OVERTIME** (single-step).

| Method | Path | Purpose |
|---|---|---|
| GET | `/approvals/my-tasks?type=` | Things I must approve (approver inbox) |
| GET | `/approvals/my-requests?status=` | Status of things I submitted |
| POST | `/approvals/:ref/submit` | Approve / reject a task |
| GET | `/approvals/:ref/target-details` | Underlying record for a task |
| GET | `/approvals/approvers?moduleKey=` | Resolved approver chain for a module |

**`GET /approvals/my-tasks`** → array of:
```jsonc
{ "id": "LEAVE:clx123", "type": "LEAVE", "status": "PENDING",
  "currentStep": 1, "totalSteps": 2, "currentApprover": "HR Manager",
  "initiator": { "name": "Asha M.", "department": "Finance" },
  "summary": { "leaveType": "Annual", "startDate": "…", "endDate": "…", "days": 5, "reason": "…" },
  "chain": [ { "step":1, "designation":"HR Manager", "state":"CURRENT" },
             { "step":2, "designation":"CEO", "state":"PENDING" } ],
  "createdAt": "…" }
```
Render the visual step timeline from `chain` (states: `APPROVED | CURRENT | PENDING | REJECTED`).

**`POST /approvals/:ref/submit`** → body `{ "action": "APPROVE" | "REJECT", "comments": "…" }`.
- Multi-level LEAVE: an APPROVE that isn't the last configured step advances the stage
  (`status` stays `PENDING`, `approvalStage` increments) and notifies the next approver;
  the final step finalizes (balance applied). REJECT finalizes immediately.
- Only the eligible approver for the current stage may act (else `403`).

**`GET /approvals/my-requests`** → the employee's own submissions across types with
`status`, `currentStep`/`totalSteps`, `chain`, `rejectionReason` — use this for "track my requests".

**`GET /approvals/approvers?moduleKey=LEAVE`** → `{ moduleKey, sequence:[designations], approvers:[{ step, designation, userId, name }] }`.

---

## 9. Notifications

| Method | Path | Purpose |
|---|---|---|
| GET | `/notifications/me?unreadOnly=` | My notifications (latest 50) |
| GET | `/notifications/me/unread-count` | Unread badge count |
| PUT | `/notifications/:id/read` | Mark one read |
| PUT | `/notifications/read-all` | Mark all read |

Approval events (assigned to you, your request approved/rejected, reassigned) arrive here
with `type: "APPROVAL"` and `link: "/approvals"`. Poll `unread-count` for the badge.

---

## 10. Management / Admin endpoints (permission-gated)

These power the management area a permissioned employee (or company admin) sees. Each requires
the listed permission (`403` otherwise). Show them based on `GET /auth/me/permissions` (§3).
Non-exhaustive; representative overview endpoints:

| Module | Endpoint(s) | Required permission |
|---|---|---|
| Dashboard | `GET /dashboard/overview`, `GET /dashboard/directory` | `analytics.read`, `employees.read` |
| Leave admin | `GET /leave-admin/overview`, `POST /leave-admin/leave-types`, `POST /leave-admin/requests/:id/respond` | `leave.read` / `leave.write` / `leave.manage` |
| Attendance admin | `GET /attendance-admin/overview`, `POST /attendance-admin/overtime/:id/decision`, `PUT /attendance-admin/overtime/settings` | `attendance.read` / `attendance.manage` |
| Payroll | `GET /payroll/runs`, `POST /payroll/runs`, `PUT /payroll/runs/:id/approve`, `/payroll/advances`, `/payroll/adjustments` | `payroll.read` / `payroll.write` / `payroll.manage` |
| Employees | `GET /employees`, `POST /employees`, `PUT /employees/:id`, `/employees/:id/documents` | `employees.read` / `employees.write` / `employees.delete` |
| Movement/Offboarding | `/movements/*`, `/offboarding/*` | `employees.*` |
| Contracts | `/contracts/*` (create/approve/renew/terminate) | `contracts.read/write/manage` |
| Benefits / Training | `/benefits/admin/*`, `POST /training` | `benefits.*` / `training.*` |
| HR queries (staff) | `GET /hrquery/all`, `POST /hrquery/:id/reply` | `employees.read` / `employees.write` |
| Settings | `/settings/workspace/:companyId`, `/settings/{business-units,sections,job-titles,grades,positions,contract-types}` | `settings.read/write/manage/delete` |
| Roles & permissions (IAM) | `/iam/roles`, `/iam/users/:userId/roles`, `/iam/permissions` | `iam.read/write/delete` |

**Approval configuration** (who reviews/approves each module) lives in workspace settings:
`GET/PUT /settings/workspace/:companyId` → the `approvalConfigs` array
(`{ moduleKey, levels, initiators[], reviewers[], approvers[] }`, designations by role name).
This config is exactly what drives the multi-level flow in §8.

---

## 11. Integration recipes

**Login → boot the app**
1. `POST /auth/login` → store tokens + `user`.
2. `GET /auth/me/permissions` → build management nav (§3).
3. `GET /employees/me` → profile/header.
4. `GET /notifications/me/unread-count` → badge.

**Portal home**
- `GET /attendance/me/today` (clock widget) · `GET /leave/me/balance` (balances) ·
  `GET /approvals/my-tasks` (if any → show "N to approve") · `GET /approvals/my-requests` (my pending).

**Clock in flow**
1. `GET /attendance/clock-in/preflight/:employeeId` → decide button state; if `geofenceRequired`, get device GPS.
2. `POST /attendance/clock-in` with `{ latitude, longitude, source }`.

**Apply for leave**
1. `GET /leave/policy/categories` → dropdown.
2. `POST /leave/requests` → on success refresh `GET /leave/me/balance` and the list.

**Approver inbox**
1. `GET /approvals/my-tasks` → list + `chain` timeline.
2. `GET /approvals/:ref/target-details` → detail panel.
3. `POST /approvals/:ref/submit` `{ action, comments }` → refresh list.

**Raise / track an HR query**
- `POST /hrquery` (create) · `GET /hrquery/me` (list) · `GET /hrquery/me/:id` (thread) ·
  `POST /hrquery/me/:id/message` (reply).

---

## Appendix — status vocabularies

- **Leave:** `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`.
- **Approval task state (chain):** `PENDING`, `CURRENT`, `APPROVED`, `REJECTED`.
- **Attendance record:** `PRESENT`, `LATE`, `ABSENT`, `HALF_DAY`, `ON_LEAVE`.
- **Overtime (via `/approvals` or my-requests):** `PENDING` → `APPROVED` (authorized) / `REJECTED` (unauthorized).
- **HR query:** `OPEN`, `RESOLVED`, `CLOSED`.

*All paths are under `/api/v1`. All requests need `Authorization: Bearer <accessToken>` unless marked Public.*
