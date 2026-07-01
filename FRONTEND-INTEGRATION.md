# Employee Portal — Frontend Integration Guide

Audience: the frontend implementer (e.g. Claude in the EHRM-WEB-NEW repo).
This explains **how to integrate every employee-portal API** — auth, the
permission-gating reality, shared conventions, and each endpoint's
request/response/UI-states.

**Status legend**
- 🟢 **LIVE** — implemented and functional now (after the linkage backfill, below). Integrate today.
- 🟡 **PENDING-BACKEND** — specced in [API-REQUIREMENTS.md](API-REQUIREMENTS.md), not built yet. Build the UI behind a flag; wire when it ships.
- 🔵 **WIRE-EXISTING** — backend exists, frontend currently on mock — just point it at the live endpoint.

---

## 0. Read this first — two hard prerequisites

### a) The `/me` linkage backfill
Every `/me` endpoint resolves the employee via `User.employeeId`. Until the
one-time backfill runs (`scripts/backfill-user-employee-link.ts`), existing
users get **HTTP 404 `{ message: "Employee profile not found for this user" }`**
on every `/me` call — even though the endpoint works. If you see that 404
across the board, it's the backfill, not your integration. New employees created
after the code fix are linked automatically.

### b) Permissions are NOT surfaced yet (gating strategy)
**Verified:** `/auth/login` and `/auth/me` return `permissions: []` and
`roles: []` hardcoded. There is no permission data on the client today, and no
`@RequirePermissions` enforcement on portal routes. **Do not gate UI on
`permissions[]` yet — it will always be empty.**

| Phase | What's available | How to gate the portal |
|---|---|---|
| **Now** | `GET /employees/me/direct-reports` (real data) | Show MSS / Approvals / Management surfaces **only if the user has ≥1 direct report**. Everything else is plain self-service, shown to all authenticated employees. |
| **After backend §0 ships** | `permissions[]`, `roles[]`, `isManager`, `directReportsCount` on `/auth/me` | Switch gating to real permission strings (`leave.manage`, `payroll.manage`, …) for true per-domain control. |

Write the gating helper so the switch is one place:
```js
// today: manager === has direct reports. later: prefer me.isManager / me.permissions.
export function canSeeApprovals(me) {
  if (Array.isArray(me?.permissions) && me.permissions.length) {
    return me.permissions.some(p => p.endsWith(".manage"));
  }
  return (me?.directReportsCount ?? me?.directReports?.length ?? 0) > 0;
}
```

---

## 1. Conventions (apply to every call)

- **Base URL**: `/api/v1` (e.g. `POST /api/v1/auth/login`).
- **Response envelope**: every success is wrapped:
  ```json
  { "success": true, "data": <payload>, "meta": { "requestId": null, "timestamp": "2026-06-30T..." } }
  ```
  **Always read `res.data.data`.** (The "Response" blocks in this doc show the
  inner `data` payload only.)
- **Auth header**: `Authorization: Bearer <accessToken>` on every call except the
  `@Public` auth routes (login, register, refresh, forgot/reset, confirm-email, OTP).
- **Errors**: Nest standard — `{ "statusCode": 4xx, "message": "...", "error": "..." }`.
  Common: `401` (bad/expired token → refresh & retry), `403` (not your record /
  not the manager), `404` (not found or `/me` not linked), `400` (validation).
- **Dates**: ISO-8601. Date-only fields (`date`, `startDate`) accept `YYYY-MM-DD`.
- **UI states**: every list endpoint can return `[]` — render a real empty state,
  never mock placeholders. Show loading on first fetch; surface `message` on error.

---

## 2. Auth & session 🟢

| Method | Route | Body | Returns (`data`) |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| GET | `/auth/me` | — (Bearer) | `{ valid, user }` *(roles/permissions = pending §0)* |
| POST | `/auth/logout` | — (Bearer) | `{ success }` |
| POST | `/auth/login/phone` | `{ phone }` | `{ message }` (OTP sent) |
| POST | `/auth/login/phone/verify` | `{ phone, otp }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/forgot-password` | `{ email }` | `{ message }` |
| POST | `/auth/reset-password` | `{ token, password }` | `{ message }` |
| POST | `/auth/confirm-email` | `{ token }` | `{ message }` |

**Session flow**: store both tokens; access token expires in **15m**, refresh in
**7d**. On any `401`, call `/auth/refresh` once, retry the original request, and
if refresh also fails, log out. `user` from login is the source of identity;
re-fetch `/auth/me` on app load to revalidate.

---

## 3. Dashboard 🟢

- **`GET /dashboard/me`** — the home aggregate. One call powers the whole home
  screen. Returns: `{ profile, today (attendance), attendance (month stats),
  leave (balances + snapshot), pendingTasks, unreadNotifications, pendingExpenses,
  upcomingTrainings, recentAnnouncements, activeReview }`. Render each card from
  its slice; any slice may be empty.
- **`GET /dashboard/directory?search=&departmentId=`** — company people directory,
  ACTIVE employees, max 50. Returns array of `{ id, employeeNumber, jobTitle,
  department, branch, user{fullName,email,...} }`.

---

## 4. Profile & documents

| Status | Method | Route | Notes |
|---|---|---|---|
| 🟢 | GET | `/employees/me` | Full own profile (+ branch, department). |
| 🟢 | PUT | `/employees/me` | **Whitelisted fields only**: `city, address, maritalStatus, emergencyName, emergencyPhone, emergencyRelation, bankName, bankAccount, bankBranch, mobileMoney, mobileMoneyName, nationalId, tin, nssfNumber`. Anything else is ignored server-side. |
| 🟢 | GET | `/employees/me/documents` | Read own docs (checklist + uploaded), unified list `{ id, category, name, type, label, uploadedAt, url }`. |
| 🟢 | GET | `/employees/me/direct-reports` | **Use this as the manager signal.** Empty array = not a manager. |
| 🟡 | POST/DELETE | `/employees/me/documents` | **Self-upload** — not built. See API-REQUIREMENTS §3 (storage strategy undecided). Build the upload UI; keep it disabled until it ships. |

---

## 5. Attendance

| Status | Method | Route | Notes |
|---|---|---|---|
| 🟢 | GET | `/attendance/me/today` | `{ status, checkIn, checkOut, workMinutes, ... }` or `{ status: "NOT_CHECKED_IN" }`. Drives the clock widget. |
| 🟢 | POST | `/attendance/me/checkin` | No body. Blocks double check-in (400). Returns record with `status` PRESENT/LATE. |
| 🟢 | POST | `/attendance/me/checkout` | No body. Requires an open check-in. Returns `workMinutes`, `overtime`. |
| 🟢 | GET | `/attendance/me?month=&year=` | `{ summary: { present, late, absent, halfDay, onLeave, totalWorkMinutes, totalOvertime }, records[] }`. |
| 🟢 | GET | `/attendance/team?date=` | **Manager view-only** (direct reports). No approve action exists. |
| 🟡 | — | `/attendance/me/corrections`, `/attendance/me/overtime` (+ `/team/.../approve`) | Corrections & OT-requests — not built. API-REQUIREMENTS §4, §5. |
| ❌ | — | attendance `score` | No backend source; do not display a score until specced. |

---

## 6. Leave

| Status | Method | Route | Notes |
|---|---|---|---|
| 🟢 | GET | `/leave/types` | Active leave types. |
| 🟢 | GET | `/leave/me/balance` | Per-type balances; `available = total + carried − used − pending`. |
| 🟢 | GET | `/leave/me/applications?status=` | Own applications. |
| 🟢 | POST | `/leave/me/apply` | `{ leaveTypeId, startDate, endDate, reason, handoverNotes }`. Server validates balance, overlap, working-days. 400 on insufficient balance/overlap — surface `message`. |
| 🟢 | DELETE | `/leave/me/:id` | Cancel own **pending** request only. |
| 🟢 | GET | `/leave/team?status=` | **Manager**: direct reports' requests. |
| 🟢 | PUT | `/leave/team/:id/approve` | **Manager**: `{ action: "APPROVED"\|"REJECTED", reason? }`. 403 if you're not the report's manager. |
| 🟡 | — | `/leave/me/encashment` (+ admin respond) | Leave cash-out — not built. API-REQUIREMENTS §6. |

---

## 7. Payroll 🟢 / 🔵

| Status | Method | Route | Notes |
|---|---|---|---|
| 🔵 | GET | `/payroll/me/payslips?year=` | List own payslips. **This is the employee "payroll" module — wire it, no backend work needed.** |
| 🔵 | GET | `/payroll/me/payslips/:id` | Full breakdown (earnings/deductions line items). |
| 🔵 | GET | `/payroll/me/advances` | Own advances + installment schedules. |
| 🟢 | POST | `/payroll/me/advances` | `{ amount, repaymentMonths (1–12), reason? }`. Server caps at 2× basic salary, blocks a second active advance. |

---

## 8. Notifications

| Status | Method | Route | Notes |
|---|---|---|---|
| 🟢 | GET | `/notifications/me?unreadOnly=` | Newest 50. |
| 🟢 | GET | `/notifications/me/unread-count` | `{ count }` — for the bell badge; poll or refetch on focus. |
| 🟢 | PUT | `/notifications/:id/read` | Mark one read. |
| 🟢 | PUT | `/notifications/read-all` | Mark all read. |
| 🟡 | GET/PUT | `/notifications/me/preferences` | Channel/digest prefs — not built. API-REQUIREMENTS §2. |

---

## 9. Tasks 🟢
- **`GET /tasks/me?status=`** — assigned to me, priority desc → due asc.
- **`PUT /tasks/:id`** — `{ status }` (TODO/IN_PROGRESS/DONE); assignee-checked.

---

## 10. Performance

| Status | Method | Route | Notes |
|---|---|---|---|
| 🔵 | GET | `/performance/me/reviews` | Own reviews (+ goals). **Exists — the report wrongly called it missing.** |
| 🔵 | GET | `/performance/me/reviews/:id` | One review. |
| 🟢 | PUT | `/performance/me/reviews/:id/self-review` | `{ rating (1–5), comment }`. One-way → status `MANAGER_REVIEW`. |
| 🟢 | GET / POST | `/performance/me/goals` | List / create `{ title, description, targetDate, weight, reviewId }`. |
| 🟢 | PUT | `/performance/me/goals/:id/progress` | `{ progress (0–100), status }`. |
| 🟢 | GET | `/performance/team/reviews` | **Manager** reviews. |
| 🟢 | PUT | `/performance/team/reviews/:id/manager-review` | **Manager** review submit. |
| 🟡 | GET | `/performance/me` | Summary roll-up — not built. API-REQUIREMENTS §1. Use `/me/reviews` + `/me/goals` until then. |

---

## 11. Benefits 🟢
- **`GET /benefits`** — company benefits with an `enrolled` flag per item.
- **`GET /benefits/me`** — own enrollments + 5 recent claims each.
- **`GET /benefits/me/claims`** — own claims.
- **`POST /benefits/me/claims`** — `{ enrollmentId, amount, description, documents[]? }`; enforces `maxAmount`.

## 12. Expenses 🟢
- **`GET /expenses/me?status=`**, **`GET /expenses/me/:id`** — own claims (+ items).
- **`POST /expenses/me`** — `{ title, description, currency (TZS), items[]: { category, description, amount, date, receipt } }`; ≥1 item required.
- **`DELETE /expenses/me/:id`** — cancels a pending claim (note: server sets status to `REJECTED`, not `CANCELLED`).

## 13. Training 🟢 / 🔵
- 🔵 **`GET /training`** — catalog with `myEnrollment` flag (mandatory-first). *Wire the catalog UI to this.*
- 🟢 **`GET /training/me/enrollments`**, **`POST /training/:id/enroll`**, **`POST /training/:id/complete`** (`{ score? }`).

## 14. Announcements 🟢
- **`GET /announcements`** — published, non-expired, targeted to the employee's dept/branch (pinned first).
- **`GET /announcements/:id`**.

## 15. HR queries (helpdesk) 🟢
- **`GET /hrquery/me`**, **`GET /hrquery/me/:id`** (thread).
- **`POST /hrquery`** — `{ subject, message, category=GENERAL, priority=NORMAL }`.
- **`POST /hrquery/me/:id/message`** — `{ message }` (blocked if ticket CLOSED).

## 16. Schedule & shifts 🟢 / 🔵
- 🟢 **`GET /schedule/me?month=&year=`** — `{ assignments, attendance, holidays, leaveRequests }`.
- 🟢 **`GET /schedule/holidays?year=`**.
- 🔵 **Shift swaps EXIST** — the report wrongly called them missing. Wire to:
  **`POST /schedule/swap/request`** `{ targetEmployeeId, myDate, theirDate, reason? }`,
  **`GET /schedule/swap/me`** (sent + received),
  **`PUT /schedule/swap/:id/respond`** `{ accept: boolean }` (you must be the target).

---

## 17. Approvals / Management (MSS) — partial today

**What's real now** (gate the whole surface on `direct-reports.length > 0`):
leave team-approval (§6), performance team manager-review (§10),
team-attendance view (§5), shift-swap respond (§16).

**What has NO employee/manager backend** (do **not** build live UI; keep mock
behind a flag or hide): OT approvals, expense approvals at manager level,
training approvals, advance approvals, the multi-level workflow engine,
delegation, and the Approvals "My Requests / History / Settings" tabs. These need
the per-domain manager endpoints + the §0 permission surfacing first. Build the
UI shell only; wire when the backend lands.

---

## 18. Integration checklist (per module)
1. Read `res.data.data` (envelope).
2. Attach Bearer token; implement the refresh-on-401-retry-once flow.
3. Handle the global `/me` 404 (linkage backfill) with a clear message, not a crash.
4. Render real loading / empty / error states — no mock fallbacks.
5. Gate MSS surfaces on direct-reports today; swap to `permissions[]` when §0 ships.
6. For 🟡 endpoints: build UI, keep disabled/flagged, reference API-REQUIREMENTS.md for shapes.
