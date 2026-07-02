/**
 * Seed employees, attendance and leave for a single hardcoded company.
 *
 * Idempotent — safe to re-run. Skips data that already exists for a given
 * (employee, year) so subsequent runs only fill what's missing.
 *
 * Covers every writable field on the User, Employee, Attendance,
 * LeaveRequest and LeaveBalance models (no branches/departments/etc.
 * are created — those are left null and use whatever already exists).
 *
 * Default password for every employee User:  Demo@2026
 *
 * Run:  npx ts-node prisma/seed-employees-data.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Demo@2026';
const PASSWORD_HASH_ROUNDS = 10;
const COMPANY_ID = 'cmqs7kzwc0000evvvrck846vj';

// ─── Helpers ────────────────────────────────────────────────────────────────

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function dateOnlyUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function pad(n: number, len = 2) {
  return String(n).padStart(len, '0');
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Reference data ────────────────────────────────────────────────────────

const TANZANIA_CITIES = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Moshi', 'Mbeya', 'Tanga', 'Zanzibar'];
const STREETS = ['Bagamoyo Road', 'Morogoro Road', 'Nyerere Road', 'Uhuru Street', 'Sam Nujoma Road', 'Bibi Titi Mohamed Street', 'Lumumba Road', 'Kilwa Road'];
const BANKS = ['CRDB Bank', 'NMB Bank', 'Stanbic Bank', 'Equity Bank', 'Absa Bank', 'Bank of Africa'];
const MM_PROVIDERS = ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa'];
const DEPENDENTS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];
const SICK_SUBCATEGORIES = ['Outpatient', 'Hospitalisation', 'Dental', 'Optical', 'Maternity-related', 'Mental Health'];
const HANDOVER_NOTES = [
  'Pending tasks handed over to team lead.',
  'Reports left in shared drive for review.',
  'On-call coverage arranged with colleague.',
  'Client follow-ups scheduled before leave.',
  'No critical items pending.',
];
const APPROVERS = [
  { firstName: 'Joseph',  lastName: 'Mwandosya', role: 'HR Director' },
  { firstName: 'Beatrice', lastName: 'Kileo',    role: 'Department Head' },
  { firstName: 'Hamisi',   lastName: 'Juma',      role: 'Line Manager' },
];

// 20 employees with realistic names, gender, role
const EMPLOYEES = [
  { firstName: 'Amina',   lastName: 'Mwangi',    gender: 'Female', jobTitle: 'HR Manager' },
  { firstName: 'James',   lastName: 'Ochieng',   gender: 'Male',   jobTitle: 'Operations Lead' },
  { firstName: 'Fatuma',  lastName: 'Ally',      gender: 'Female', jobTitle: 'Senior Accountant' },
  { firstName: 'Grace',   lastName: 'Kimani',    gender: 'Female', jobTitle: 'Office Administrator' },
  { firstName: 'Peter',   lastName: 'Njoroge',   gender: 'Male',   jobTitle: 'Logistics Officer' },
  { firstName: 'Sarah',   lastName: 'Bakari',    gender: 'Female', jobTitle: 'Sales Executive' },
  { firstName: 'David',   lastName: 'Mwakasege', gender: 'Male',   jobTitle: 'Systems Administrator' },
  { firstName: 'Mary',    lastName: 'Mwasapi',   gender: 'Female', jobTitle: 'Finance Officer' },
  { firstName: 'Joseph',  lastName: 'Mlawa',     gender: 'Male',   jobTitle: 'IT Support' },
  { firstName: 'Zainab',  lastName: 'Hassan',    gender: 'Female', jobTitle: 'Recruiter' },
  { firstName: 'Michael', lastName: 'Mallya',    gender: 'Male',   jobTitle: 'Sales Representative' },
  { firstName: 'Esther',  lastName: 'Mwaikambo', gender: 'Female', jobTitle: 'Receptionist' },
  { firstName: 'Daniel',  lastName: 'Senga',     gender: 'Male',   jobTitle: 'Operations Analyst' },
  { firstName: 'Halima',  lastName: 'Mbarak',    gender: 'Female', jobTitle: 'Accounts Assistant' },
  { firstName: 'Yusuf',   lastName: 'Athumani',  gender: 'Male',   jobTitle: 'Software Engineer' },
  { firstName: 'Rehema',  lastName: 'Shomari',   gender: 'Female', jobTitle: 'Marketing Coordinator' },
  { firstName: 'Ibrahim', lastName: 'Selemani',  gender: 'Male',   jobTitle: 'Procurement Officer' },
  { firstName: 'Aisha',   lastName: 'Rashidi',   gender: 'Female', jobTitle: 'HR Officer' },
  { firstName: 'Oscar',   lastName: 'Mrema',     gender: 'Male',   jobTitle: 'Network Engineer' },
  { firstName: 'Lucy',    lastName: 'Mussa',     gender: 'Female', jobTitle: 'Executive Assistant' },
];

// ─── Date range ────────────────────────────────────────────────────────────

const YEAR = 2026;
const START = new Date(Date.UTC(2026, 0, 1));
const END   = new Date(Date.UTC(2026, 6, 31));
const TODAY = new Date();
const MAX_DATE = TODAY < END ? TODAY : END;

const STATUS_PICKER = () => {
  const r = Math.random();
  if (r < 0.85) return 'PRESENT';
  if (r < 0.90) return 'LATE';
  if (r < 0.93) return 'ABSENT';
  if (r < 0.98) return 'ON_LEAVE';
  return 'HALF_DAY';
};

// Realistic HQ location (Dar es Salaam, Masaki)
const HQ_LAT = -6.7470;
const HQ_LNG = 39.2785;
const jitter = (v: number) => v + (Math.random() - 0.5) * 0.005;

// ─── Loaders ───────────────────────────────────────────────────────────────

async function loadCompany() {
  const company = await prisma.company.findUnique({ where: { id: COMPANY_ID } });
  if (!company) throw new Error(`Company ${COMPANY_ID} not found`);
  console.log(`✓ Company: ${company.name} (${COMPANY_ID})`);
  return company;
}

async function ensureApprovers(companyId: string) {
  // Try to find an employee of the company to be the approver reference.
  // We only need a user id to attach; we use the first user we can find in
  // the company.
  const u = await prisma.user.findFirst({ where: { companyId }, select: { id: true } });
  return u?.id || null;
}

async function ensureEmployee(
  companyId: string,
  passwordHash: string,
  spec: typeof EMPLOYEES[number],
  index: number,
) {
  const email = `${spec.firstName.toLowerCase()}.${spec.lastName.toLowerCase().replace(/[^a-z]/g, '')}@demoehrm.co.tz`;
  const fullName = `${spec.firstName} ${spec.lastName}`;
  const employeeNumber = `EMP-${String(index + 1).padStart(4, '0')}`;
  const phone = `+2557${randInt(10, 99)}${randInt(1000000, 9999999)}`;

  // Skip if employee number already exists in this company
  let employee = await prisma.employee.findFirst({
    where: { companyId, employeeNumber },
  });
  if (employee) return employee;

  // Find or create User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        firstName: spec.firstName,
        lastName: spec.lastName,
        fullName,
        companyId,
        employeeId: null, // set after we create the employee
        role: 'Employee',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        mfaEnabled: false,
        failedAttempts: 0,
      },
    });
  } else if (user.companyId !== companyId) {
    user = await prisma.user.update({ where: { id: user.id }, data: { companyId } });
  }

  // Dates
  const startDate = new Date(Date.UTC(YEAR - randInt(0, 4), randInt(0, 11), randInt(1, 28)));
  const dob = new Date(Date.UTC(YEAR - randInt(26, 55), randInt(0, 11), randInt(1, 28)));
  const contractEnd = new Date(startDate);
  contractEnd.setUTCFullYear(contractEnd.getUTCFullYear() + 2);
  const probationEnd = new Date(startDate);
  probationEnd.setUTCMonth(probationEnd.getUTCMonth() + 6);
  const city = pick(TANZANIA_CITIES);

  // TIN is 9 digits for individuals, 10–11 for orgs
  const tin = String(randInt(100000000, 999999999));
  const nationalId = String(randInt(199000000000000, 200499999999999));
  const nssf = `NSSF-${randInt(100000000, 999999999)}`;
  const basicSalary = randInt(900_000, 3_200_000);
  const gross = Math.round(basicSalary * 1.15);
  const mobile = `+2557${randInt(10, 99)}${randInt(1000000, 9999999)}`;
  const emergencyName = `${pick(['Hassan', 'Mariam', 'John', 'Fatma', 'Peter', 'Aisha'])} ${pick(['Mwakikoti', 'Said', 'Mhina', 'Mwasapi'])}`;
  const emergencyPhone = `+2557${randInt(10, 99)}${randInt(1000000, 9999999)}`;

  // Rich JSON blobs (used by UI for profile screens)
  const checklist = JSON.stringify([
    { id: 'id-copy', label: 'National ID copy', completed: true },
    { id: 'cv', label: 'Updated CV', completed: true },
    { id: 'certificates', label: 'Education certificates', completed: true },
    { id: 'bank', label: 'Bank account details', completed: true },
    { id: 'photo', label: 'Passport photo', completed: true },
    { id: 'contract', label: 'Signed employment contract', completed: true },
  ]);
  const complianceStatus = JSON.stringify({
    nssf: 'Compliant',
    nhif: 'Compliant',
    tcf: 'Pending',
    trainingCompleted: 4,
    trainingRequired: 6,
  });
  const documents = JSON.stringify([
    { id: 'd1', name: 'Employment Contract.pdf', type: 'Contract', uploadedAt: ymd(startDate) },
    { id: 'd2', name: 'National ID.pdf', type: 'ID', uploadedAt: ymd(startDate) },
    { id: 'd3', name: 'Tax Card.pdf', type: 'Tax', uploadedAt: ymd(startDate) },
  ]);
  const education = JSON.stringify([
    { id: 'e1', level: 'Bachelor', field: pick(['Business Administration', 'Accounting', 'Computer Science', 'Human Resources', 'Marketing', 'Finance']), institution: pick(['University of Dar es Salaam', 'Mzuzu University', 'Makerere University', 'Dodoma University', 'Open University of Tanzania']), yearCompleted: YEAR - randInt(2, 8) },
  ]);
  const qualifications = JSON.stringify([
    { id: 'q1', name: pick(['CPA', 'PMP', 'CFA', 'CHRP', 'ITIL', 'PRINCE2']), issuer: 'Professional Body', year: YEAR - randInt(1, 5) },
  ]);
  const skills = JSON.stringify([
    { id: 's1', name: pick(['JavaScript', 'Excel', 'Project Management', 'Recruitment', 'Accounting', 'Public Speaking', 'Negotiation', 'SQL', 'Customer Service']), level: pick(['Beginner', 'Intermediate', 'Advanced', 'Expert']) },
    { id: 's2', name: pick(['Team Leadership', 'Data Analysis', 'Report Writing', 'Budgeting', 'Marketing', 'Logistics', 'Training']), level: pick(['Beginner', 'Intermediate', 'Advanced', 'Expert']) },
    { id: 's3', name: pick(['English', 'Swahili', 'French']), level: 'Fluent' },
  ]);
  const languages = JSON.stringify([
    { id: 'l1', name: 'English', proficiency: 'Fluent' },
    { id: 'l2', name: 'Swahili', proficiency: 'Native' },
  ]);
  const emergencyContacts = JSON.stringify([
    { id: 'ec1', name: emergencyName, relation: pick(DEPENDENTS), phone: emergencyPhone, isPrimary: true },
  ]);
  const family = JSON.stringify([
    { id: 'f1', name: emergencyName, relation: pick(DEPENDENTS), dob: ymd(dob) },
  ]);
  const metadata = JSON.stringify({
    source: 'seed',
    seedVersion: '1.0',
    createdBy: 'seed-employees-data.ts',
  });

  employee = await prisma.employee.create({
    data: {
      companyId,
      // Optional FKs left null — branches/departments are not created
      branchId: null,
      departmentId: null,
      managerId: null,
      jobTitleId: null,
      gradeId: null,
      sectionId: null,
      businessUnitId: null,
      contractTypeId: null,

      // Identifiers
      employeeNumber,
      employmentType: 'FULL_TIME',
      employmentMode: pick(['ONSITE', 'HYBRID', 'REMOTE']),
      startDate,
      endDate: null,
      status: 'ACTIVE',
      basicSalary,
      currency: 'TZS',
      gross,

      // Personal info
      firstName: spec.firstName,
      lastName: spec.lastName,
      fullName,
      email,
      phone,
      gender: spec.gender,
      dateOfBirth: dob,
      nationalId,
      tin,
      nssfNumber: nssf,
      passportNumber: `TA${String(randInt(1000000, 9999999))}`,
      nationality: 'Tanzanian',
      maritalStatus: pick(['Single', 'Married', 'Divorced']),
      address: `${randInt(1, 200)} ${pick(STREETS)}, ${city}`,
      city,
      profilePhoto: `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`,

      // Banking
      bankName: pick(BANKS),
      bankAccount: String(randInt(1000000000, 9999999999)),
      bankBranch: `${pick(['City', 'Independence', 'Kariakoo', 'Masaki', 'Mlimani'])} Branch`,
      mobileMoney: mobile,
      mobileMoneyName: `${spec.firstName} ${spec.lastName}`,

      // Emergency contact
      emergencyName,
      emergencyPhone,
      emergencyRelation: pick(DEPENDENTS),

      // Onboarding workflow
      stage: 'Approved',
      approvalStage: 5,
      role: spec.jobTitle,
      joiningDate: ymd(startDate),
      contractStartDate: ymd(startDate),
      contractEndDate: ymd(contractEnd),
      probationEndDate: ymd(probationEnd),
      modeOfPayment: 'Bank Transfer',

      // Rich JSON blobs
      checklist,
      complianceStatus,
      documents,
      education,
      qualifications,
      skills,
      languages,
      emergencyContacts,
      family,
      metadata,

      // System
      userId: user.id,
      createdById: user.id,
    },
  });

  // Link User back to Employee (both directions)
  await prisma.user.update({ where: { id: user.id }, data: { employeeId: employee.id } });

  // Attach Employee role if it exists
  const empRole = await prisma.role.findFirst({ where: { name: 'Employee' } });
  if (empRole) {
    try {
      await prisma.userRole.create({ data: { userId: user.id, roleId: empRole.id } });
    } catch {
      // already linked
    }
  }

  return employee;
}

async function ensureLeaveBalances(
  employeeId: string,
  companyId: string,
  leaveTypeMap: Record<string, string>,
) {
  for (const [code, leaveTypeId] of Object.entries(leaveTypeMap)) {
    const existing = await prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year: YEAR } },
    });
    if (existing) continue;
    const lt = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
    if (!lt) continue;
    await prisma.leaveBalance.create({
      data: {
        employeeId,
        companyId,
        leaveTypeId,
        year: YEAR,
        totalDays: lt.daysPerYear,
        usedDays: 0,
        pendingDays: 0,
        carriedOver: 0,
      },
    });
  }
}

async function ensureLeaveRequests(
  employeeId: string,
  companyId: string,
  leaveTypeMap: Record<string, string>,
  gender: string,
  approverUserId: string | null,
) {
  const existing = await prisma.leaveRequest.count({ where: { employeeId } });
  if (existing > 0) return;

  const codes = Object.keys(leaveTypeMap);
  const count = randInt(1, 3);
  const picked = [...codes].sort(() => Math.random() - 0.5).slice(0, count);

  for (const code of picked) {
    const leaveType = await prisma.leaveType.findUnique({ where: { id: leaveTypeMap[code] } });
    if (!leaveType) continue;
    if (leaveType.gender && leaveType.gender !== gender) continue;

    const startOffset = randInt(0, 180);
    const maxDur = leaveType.daysPerYear;
    const duration = randInt(1, Math.min(10, maxDur));
    const start = addDays(START, startOffset);
    const end = addDays(start, Math.max(0, duration - 1));
    if (end > MAX_DATE) continue;

    const r = Math.random();
    const status = r < 0.7 ? 'APPROVED' : r < 0.9 ? 'PENDING' : 'REJECTED';

    await prisma.leaveRequest.create({
      data: {
        companyId,
        employeeId,
        leaveTypeId: leaveTypeMap[code],
        startDate: dateOnlyUTC(start),
        endDate: dateOnlyUTC(end),
        totalDays: duration,
        reason: pick([
          'Family commitment',
          'Personal travel',
          'Medical appointment',
          'Vacation',
          'Wedding ceremony',
          'Bereavement',
          'Religious observance',
        ]),
        status,
        approvalStage: status === 'PENDING' ? 0 : 5,
        approvalConfigKey: status === 'APPROVED' ? 'LEAVE' : null,
        approverId: status === 'APPROVED' ? approverUserId : null,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        rejectionReason:
          status === 'REJECTED'
            ? pick([
                'Conflicting team priorities during this period.',
                'Insufficient notice provided.',
                'Already approved leave on adjacent dates.',
              ])
            : null,
        handoverNotes: duration > 2 && status === 'APPROVED' ? pick(HANDOVER_NOTES) : null,
        sickLeaveSubCategory: code === 'SICK' ? pick(SICK_SUBCATEGORIES) : null,
      },
    });
  }
}

async function refreshLeaveBalances(
  employeeId: string,
  companyId: string,
  leaveTypeMap: Record<string, string>,
) {
  // After requests are seeded, recompute usedDays / pendingDays for each balance
  for (const leaveTypeId of Object.values(leaveTypeMap)) {
    const approvedDays = await prisma.leaveRequest.aggregate({
      where: { employeeId, leaveTypeId, status: 'APPROVED' },
      _sum: { totalDays: true },
    });
    const pendingDays = await prisma.leaveRequest.aggregate({
      where: { employeeId, leaveTypeId, status: 'PENDING' },
      _sum: { totalDays: true },
    });
    await prisma.leaveBalance.update({
      where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year: YEAR } },
      data: {
        usedDays: approvedDays._sum.totalDays || 0,
        pendingDays: pendingDays._sum.totalDays || 0,
      },
    }).catch(() => {});
  }
}

async function getApprovedLeaveDates(employeeId: string): Promise<Set<string>> {
  const requests = await prisma.leaveRequest.findMany({
    where: { employeeId, status: 'APPROVED' },
    select: { startDate: true, endDate: true },
  });
  const dates = new Set<string>();
  for (const r of requests) {
    let cur = new Date(r.startDate);
    const end = new Date(r.endDate);
    while (cur <= end) {
      dates.add(cur.toISOString().slice(0, 10));
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  }
  return dates;
}

async function ensureAttendance(
  employeeId: string,
  companyId: string,
  approvedLeaveDates: Set<string>,
) {
  const existing = await prisma.attendance.count({ where: { employeeId } });
  if (existing > 0) return;

  const records: any[] = [];
  const cursor = new Date(START);
  while (cursor <= MAX_DATE) {
    if (!isWeekend(cursor)) {
      const isoDay = ymd(cursor);
      let status: string;
      let checkIn: Date | null = null;
      let checkOut: Date | null = null;
      let workMinutes = 0;
      let lateMinutes: number | null = null;
      let checkInLat: number | null = null;
      let checkInLng: number | null = null;
      let checkOutLat: number | null = null;
      let checkOutLng: number | null = null;
      let notes: string | null = null;

      if (approvedLeaveDates.has(isoDay)) {
        status = 'ON_LEAVE';
      } else {
        status = STATUS_PICKER();
        if (status === 'PRESENT') {
          checkIn = new Date(cursor);
          checkIn.setUTCHours(8, randInt(0, 5), 0, 0);
          checkOut = new Date(cursor);
          checkOut.setUTCHours(17, randInt(0, 15), 0, 0);
          workMinutes = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000);
          checkInLat = jitter(HQ_LAT);
          checkInLng = jitter(HQ_LNG);
          checkOutLat = jitter(HQ_LAT);
          checkOutLng = jitter(HQ_LNG);
        } else if (status === 'LATE') {
          checkIn = new Date(cursor);
          checkIn.setUTCHours(8, randInt(20, 55), 0, 0);
          checkOut = new Date(cursor);
          checkOut.setUTCHours(17, randInt(0, 30), 0, 0);
          workMinutes = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000);
          lateMinutes = randInt(20, 55);
          checkInLat = jitter(HQ_LAT);
          checkInLng = jitter(HQ_LNG);
          checkOutLat = jitter(HQ_LAT);
          checkOutLng = jitter(HQ_LNG);
          notes = `Late by ${lateMinutes} minutes`;
        } else if (status === 'HALF_DAY') {
          checkIn = new Date(cursor);
          checkIn.setUTCHours(8, 0, 0, 0);
          checkOut = new Date(cursor);
          checkOut.setUTCHours(12, randInt(0, 30), 0, 0);
          workMinutes = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000);
          checkInLat = jitter(HQ_LAT);
          checkInLng = jitter(HQ_LNG);
          checkOutLat = jitter(HQ_LAT);
          checkOutLng = jitter(HQ_LNG);
          notes = 'Half day — left early';
        } else if (status === 'ABSENT') {
          notes = pick(['No call no show', 'Sick — no formal leave filed', 'Personal emergency']);
        }
      }

      const overtime =
        status === 'PRESENT' && cursor.getDay() === 5 && Math.random() < 0.3
          ? randInt(30, 90)
          : 0;

      records.push({
        companyId,
        employeeId,
        shiftId: null,
        date: dateOnlyUTC(cursor),
        checkIn,
        checkOut,
        workMinutes,
        overtime,
        status,
        isManual: false,
        notes,
        checkInLatitude: checkInLat,
        checkInLongitude: checkInLng,
        checkOutLatitude: checkOutLat,
        checkOutLongitude: checkOutLng,
        source: 'SEED',
        lateMinutes,
        approvedBy: null,
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const CHUNK = 200;
  for (let i = 0; i < records.length; i += CHUNK) {
    await prisma.attendance.createMany({ data: records.slice(i, i + CHUNK) });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('▶ Seeding employees, attendance and leave (Jan–Jul 2026)…\n');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, PASSWORD_HASH_ROUNDS);

  const company = await loadCompany();

  // Use only existing leave types
  const existingLeaveTypes = await prisma.leaveType.findMany({
    where: { companyId: company.id, isActive: true },
  });
  const leaveTypeMap: Record<string, string> = {};
  for (const lt of existingLeaveTypes) leaveTypeMap[lt.code] = lt.id;
  if (Object.keys(leaveTypeMap).length === 0) {
    console.warn('⚠ No active leave types in this company — leave data will be skipped.');
  } else {
    console.log(`✓ Leave types found: ${Object.keys(leaveTypeMap).join(', ')}`);
  }

  const approverUserId = await ensureApprovers(company.id);

  console.log(`\n▶ Creating ${EMPLOYEES.length} employees…\n`);
  let empCount = 0;
  for (let i = 0; i < EMPLOYEES.length; i++) {
    const spec = EMPLOYEES[i];
    const emp = await ensureEmployee(company.id, passwordHash, spec, i);
    if (Object.keys(leaveTypeMap).length > 0) {
      await ensureLeaveBalances(emp.id, company.id, leaveTypeMap);
      await ensureLeaveRequests(emp.id, company.id, leaveTypeMap, spec.gender, approverUserId);
      await refreshLeaveBalances(emp.id, company.id, leaveTypeMap);
    }
    const approvedLeave = await getApprovedLeaveDates(emp.id);
    await ensureAttendance(emp.id, company.id, approvedLeave);
    empCount++;
    process.stdout.write(`\r  ${empCount}/${EMPLOYEES.length} employees seeded`);
  }
  process.stdout.write('\n');

  const totalAttendance = await prisma.attendance.count({
    where: { companyId: company.id, date: { gte: START, lte: MAX_DATE } },
  });
  const totalLeave = await prisma.leaveRequest.count({ where: { companyId: company.id } });
  const totalUsers = await prisma.user.count({ where: { companyId: company.id } });

  console.log(`\n✅ Seed complete for "${company.name}" (${company.id})`);
  console.log(`   • Employees:          ${empCount}`);
  console.log(`   • User accounts:      ${totalUsers}`);
  console.log(`   • Leave requests:     ${totalLeave}`);
  console.log(`   • Attendance records: ${totalAttendance}`);
  console.log(`   • Date range:         ${ymd(START)} → ${ymd(MAX_DATE)}`);
  console.log(`   • Default password:   ${DEMO_PASSWORD}\n`);
  console.log('   Login emails: firstname.lastname@demoehrm.co.tz\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
