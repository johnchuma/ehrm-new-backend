import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApprovalsService } from '../approvals/approvals.service';

const PENDING_APPROVAL_STATUS = 'Pending Approval';
const IN_PROGRESS_STATUS = 'In Progress';
const DAY_KEYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DEFAULT_WORK_START = '08:00';
const DEFAULT_WORK_END = '17:00';

type AttendanceWorkSettings = {
  dayConfigs: Record<string, { enabled?: boolean; start?: string; startTime?: string; end?: string; endTime?: string }>;
  weekendDays: Set<string>;
  defaultStart: string;
  defaultEnd: string;
};

function normalizeJson(value: any, fallback: any) {
  if (!value) return fallback;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

function toDateOnly(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function eachDate(start: Date, end: Date) {
  const days: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor.getTime() <= last.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function isApprovedLeaveStatus(status?: string | null) {
  return ['APPROVED', 'APPROVED_STATUS', 'ACTIVE'].includes(
    String(status || '').trim().toUpperCase(),
  );
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function normalizeDayKey(value?: string | null) {
  const text = String(value || '').trim().toUpperCase();
  if (!text) return '';
  const aliases: Record<string, string> = {
    SUN: 'SUNDAY',
    SUNDAY: 'SUNDAY',
    MON: 'MONDAY',
    MONDAY: 'MONDAY',
    TUE: 'TUESDAY',
    TUES: 'TUESDAY',
    TUESDAY: 'TUESDAY',
    WED: 'WEDNESDAY',
    WEDNESDAY: 'WEDNESDAY',
    THU: 'THURSDAY',
    THUR: 'THURSDAY',
    THURS: 'THURSDAY',
    THURSDAY: 'THURSDAY',
    FRI: 'FRIDAY',
    FRIDAY: 'FRIDAY',
    SAT: 'SATURDAY',
    SATURDAY: 'SATURDAY',
  };
  return aliases[text] || '';
}

function parseDayTokenSequence(value?: string | null) {
  const text = String(value || '').trim();
  if (!text) return [];
  const tokens = text
    .split(/\s*,\s*/)
    .flatMap((part) => {
      const range = part.split(/\s*-\s*/).map(normalizeDayKey).filter(Boolean);
      if (range.length !== 2) return range;
      const start = DAY_KEYS.indexOf(range[0]);
      const end = DAY_KEYS.indexOf(range[1]);
      if (start < 0 || end < 0) return range;
      const result: string[] = [];
      let index = start;
      while (true) {
        result.push(DAY_KEYS[index]);
        if (index === end) break;
        index = (index + 1) % DAY_KEYS.length;
        if (result.length > DAY_KEYS.length) break;
      }
      return result;
    })
    .filter(Boolean);
  return [...new Set(tokens)];
}

function parseHoursRange(value?: string | null): [string, string] {
  const text = String(value || '').trim();
  const match = text.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) return [DEFAULT_WORK_START, DEFAULT_WORK_END];
  return [match[1], match[2]];
}

function pickTime(...values: Array<string | null | undefined>) {
  const value = values.find((item) => /^\d{1,2}:\d{2}$/.test(String(item || '').trim()));
  if (!value) return '';
  const [hour, minute] = String(value).split(':');
  return `${hour.padStart(2, '0')}:${minute}`;
}

function overtimeDecision(row: { overtime?: number | null; approvedBy?: string | null }) {
  if (!Number(row.overtime || 0)) return '';
  const approvedBy = String(row.approvedBy || '').trim();
  if (!approvedBy) return 'PENDING';
  return approvedBy.toUpperCase().startsWith('UNAUTHORIZED:') ? 'UNAUTHORIZED' : 'AUTHORIZED';
}

function actorName(user: any) {
  return user?.fullName || user?.name || user?.email || user?.sub || 'Admin';
}

function resolveUploadPath(fileName?: string | null) {
  if (!fileName) return '';
  const value = String(fileName).trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('/uploads/')) return value;
  return `/uploads/${value.replace(/^\/+/, '')}`;
}

async function hasApprovalFlow(companyId: string, prisma: PrismaService) {
  const cfg = await prisma.workspaceApprovalConfig.findFirst({
    where: { companyId, moduleKey: 'ATTENDANCE_BULK', isActive: true },
  });
  return !!cfg;
}

@Injectable()
export class AttendanceAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalsService,
  ) {}

  private async getOvertimeRate(companyId: string) {
    const settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
      select: { overtimeRate: true },
    });
    const amount = Number(settings?.overtimeRate || 0);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }

  private async getAttendanceWorkSettings(companyId: string): Promise<AttendanceWorkSettings> {
    const [companySettings, patterns] = await Promise.all([
      this.prisma.companySettings.findUnique({
        where: { companyId },
        select: { generalSettings: true },
      }),
      this.prisma.workingDayPattern.findMany({
        where: { companyId, isActive: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const general = normalizeJson(companySettings?.generalSettings, {});
    const generalPatterns = Array.isArray(general?.workingDays) ? general.workingDays : [];
    const source = patterns[0] || generalPatterns.find((item) => String(item?.status || 'Active').toLowerCase() !== 'inactive') || {};
    const [defaultStart, defaultEnd] = parseHoursRange(source.hours);
    const rawDayConfigs = normalizeJson(source.dayConfigs, {});
    const rawWeekendDays = normalizeJson(source.weekendDays, null);
    const weekendDays = new Set(
      (Array.isArray(rawWeekendDays) ? rawWeekendDays : parseDayTokenSequence(source.weekend || 'Sat-Sun'))
        .map(normalizeDayKey)
        .filter(Boolean),
    );
    const enabledFromPattern = parseDayTokenSequence(source.pattern || 'Mon-Fri');
    const enabledSet = new Set(enabledFromPattern.length ? enabledFromPattern : DAY_KEYS.filter((day) => !weekendDays.has(day)));
    const dayConfigs = Object.fromEntries(
      DAY_KEYS.map((day) => {
        const config = rawDayConfigs?.[day] || {};
        return [
          day,
          {
            enabled: typeof config.enabled === 'boolean' ? config.enabled : enabledSet.has(day),
            start: pickTime(config.start, config.startTime, source.startTime, defaultStart) || DEFAULT_WORK_START,
            end: pickTime(config.end, config.endTime, source.endTime, defaultEnd) || DEFAULT_WORK_END,
          },
        ];
      }),
    );

    return {
      dayConfigs,
      weekendDays,
      defaultStart,
      defaultEnd,
    };
  }

  private resolveWorkDay(settings: AttendanceWorkSettings, date: Date) {
    const dayKey = DAY_KEYS[date.getDay()];
    const config = settings.dayConfigs[dayKey] || {};
    const enabled = typeof config.enabled === 'boolean' ? config.enabled : !settings.weekendDays.has(dayKey);
    const expectedIn = pickTime(config.start, config.startTime, settings.defaultStart) || DEFAULT_WORK_START;
    const expectedOut = pickTime(config.end, config.endTime, settings.defaultEnd) || DEFAULT_WORK_END;
    return { dayKey, isWorkDay: enabled, expectedIn, expectedOut };
  }

  private async ensureDailyRecords(companyId: string, employees: Array<{ id: string }>, start: Date, end: Date) {
    if (!employees.length) return;

    const cappedEnd = (() => {
      const today = toDateOnly(new Date())!;
      const endDate = toDateOnly(end)!;
      return endDate.getTime() > today.getTime() ? today : endDate;
    })();
    const startDate = toDateOnly(start)!;
    if (startDate.getTime() > cappedEnd.getTime()) return;

    const days = eachDate(startDate, cappedEnd);
    const [workSettings, existingRows, leaveRows] = await Promise.all([
      this.getAttendanceWorkSettings(companyId),
      this.prisma.attendance.findMany({
        where: { companyId, date: { gte: startDate, lte: cappedEnd } },
        select: {
          id: true,
          employeeId: true,
          date: true,
          checkIn: true,
          checkOut: true,
          isManual: true,
          status: true,
          notes: true,
        },
      }),
      this.prisma.leaveRequest.findMany({
        where: {
          companyId,
          status: { in: ['APPROVED', 'Approved', 'approved', 'ACTIVE', 'Active'] },
          startDate: { lte: cappedEnd },
          endDate: { gte: startDate },
        },
        select: { employeeId: true, startDate: true, endDate: true, status: true },
      }),
    ]);

    const existing = new Set(
      existingRows.map((row) => `${row.employeeId}:${dateKey(row.date)}`),
    );
    const leaveByEmployee = new Map<string, Array<{ startDate: Date; endDate: Date; status: string | null }>>();
    leaveRows
      .filter((row) => isApprovedLeaveStatus(row.status))
      .forEach((row) => {
        const current = leaveByEmployee.get(row.employeeId) || [];
        current.push(row);
        leaveByEmployee.set(row.employeeId, current);
      });

    const rowsToCreate = [];
    const updates = [];
    const activeEmployeeIds = new Set(employees.map((employee) => employee.id));

    for (const row of existingRows) {
      if (!activeEmployeeIds.has(row.employeeId)) continue;
      if (row.checkIn || row.checkOut) continue;
      const workDay = this.resolveWorkDay(workSettings, row.date);
      if (!workDay.isWorkDay) {
        if (String(row.notes || '').startsWith('Auto-created daily attendance record:')) {
          updates.push(this.prisma.attendance.delete({ where: { id: row.id } }));
        }
        continue;
      }
      const onLeave = (leaveByEmployee.get(row.employeeId) || []).some((leave) => {
        const leaveStart = toDateOnly(leave.startDate)!;
        const leaveEnd = toDateOnly(leave.endDate)!;
        return row.date.getTime() >= leaveStart.getTime() && row.date.getTime() <= leaveEnd.getTime();
      });
      if (row.isManual && !onLeave) continue;
      const status = onLeave ? 'ON_LEAVE' : 'ABSENT';
      if (String(row.status).toUpperCase() !== status) {
        updates.push(
          this.prisma.attendance.update({
            where: { id: row.id },
            data: {
              status,
              notes: onLeave
                ? 'Auto-created daily attendance record: employee is on approved leave.'
                : `Auto-created daily attendance record: expected ${workDay.expectedIn}-${workDay.expectedOut}; no check-in or check-out recorded.`,
            },
          }),
        );
      }
    }

    for (const employee of employees) {
      for (const day of days) {
        const workDay = this.resolveWorkDay(workSettings, day);
        if (!workDay.isWorkDay) continue;
        const key = `${employee.id}:${dateKey(day)}`;
        if (existing.has(key)) continue;
        const onLeave = (leaveByEmployee.get(employee.id) || []).some((leave) => {
          const leaveStart = toDateOnly(leave.startDate)!;
          const leaveEnd = toDateOnly(leave.endDate)!;
          return day.getTime() >= leaveStart.getTime() && day.getTime() <= leaveEnd.getTime();
        });
        rowsToCreate.push({
          employeeId: employee.id,
          companyId,
          date: day,
          status: onLeave ? 'ON_LEAVE' : 'ABSENT',
          isManual: false,
          notes: onLeave
            ? 'Auto-created daily attendance record: employee is on approved leave.'
            : `Auto-created daily attendance record: expected ${workDay.expectedIn}-${workDay.expectedOut}; no check-in or check-out recorded.`,
        });
      }
    }

    if (rowsToCreate.length) {
      await this.prisma.attendance.createMany({
        data: rowsToCreate,
        skipDuplicates: true,
      });
    }
    if (updates.length) {
      await this.prisma.$transaction(updates);
    }
  }

  async overview(companyId: string, month?: number, year?: number) {
    const now = new Date();
    // Guard against NaN/invalid input (e.g. a month name that parseInt() turned
    // into NaN) — fall back to the current month/year so we never build an
    // Invalid Date and crash the Prisma query with a 500.
    const targetMonth =
      Number.isFinite(month) && (month as number) >= 1 && (month as number) <= 12
        ? (month as number)
        : now.getMonth() + 1;
    const targetYear = Number.isFinite(year) ? (year as number) : now.getFullYear();
    const start = new Date(targetYear, targetMonth - 1, 1);
    const end = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const employees = await this.prisma.employee.findMany({
        where: { companyId, status: { in: ['Active', 'ACTIVE'] } },
        select: {
          id: true,
          employeeNumber: true,
          fullName: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          department: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
        orderBy: { fullName: 'asc' },
      });

    await this.ensureDailyRecords(companyId, employees, start, end);

    const [workSettings, overtimeRate, attendance, shifts, locations, approvals, swaps, bulk] = await Promise.all([
      this.getAttendanceWorkSettings(companyId),
      this.getOvertimeRate(companyId),
      this.prisma.attendance.findMany({
        where: { companyId, date: { gte: start, lte: end } },
        include: {
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              fullName: true,
              profilePhoto: true,
              department: { select: { name: true } },
              branch: { select: { name: true } },
            },
          },
          shift: { select: { id: true, name: true, startTime: true, endTime: true } },
        },
        orderBy: [{ date: 'desc' }, { employee: { fullName: 'asc' } }],
      }),
      this.prisma.shift.findMany({ where: { companyId }, orderBy: { name: 'asc' } }),
      this.prisma.workspaceLocation.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.workspaceApprovalConfig.findMany({ where: { companyId, isActive: true }, orderBy: { moduleKey: 'asc' } }),
      this.prisma.shiftSwapRequest.findMany({
        where: { companyId },
        include: {
          requester: { select: { fullName: true, employeeNumber: true } },
          target: { select: { fullName: true, employeeNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendanceBulkSubmission.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const employeeById = new Map(
      employees.map((employee) => [employee.id, employee]),
    );
    const shiftById = new Map(shifts.map((shift) => [shift.id, shift]));

    const rows = attendance.map((row) => {
      const employee = employeeById.get(row.employeeId) || row.employee;
      const workDay = this.resolveWorkDay(workSettings, row.date);
      return {
        id: row.id,
        empId: row.employeeId,
        emp: employee?.fullName || employee?.employeeNumber || row.employeeId,
        photoUrl: resolveUploadPath(employee?.profilePhoto),
        dept: employee?.department?.name || 'Unassigned',
        branch: employee?.branch?.name || 'Unassigned',
        date: row.date.toISOString().slice(0, 10),
        in: row.checkIn ? row.checkIn.toISOString() : '',
        out: row.checkOut ? row.checkOut.toISOString() : '',
        hours: row.workMinutes ? Number((row.workMinutes / 60).toFixed(2)) : 0,
        overtimeMinutes: Number(row.overtime || 0),
        overtimeHours: Number((Number(row.overtime || 0) / 60).toFixed(2)),
        overtimeDecision: overtimeDecision(row),
        overtimeApprovedBy: row.approvedBy?.startsWith('UNAUTHORIZED:')
          ? row.approvedBy.replace(/^UNAUTHORIZED:/, '')
          : row.approvedBy || '',
        overtimeRate,
        overtimeAmount: Math.round((Number(row.overtime || 0) / 60) * overtimeRate),
        method: row.isManual ? 'Manual' : 'Auto',
        status: row.status,
        notes: row.notes || '',
        shift: shiftById.get(row.shiftId)?.name || '',
        missingCheckIn: !row.checkIn && !['ON_LEAVE'].includes(String(row.status).toUpperCase()),
        missingCheckOut: !!row.checkIn && !row.checkOut,
        autoCreated: !row.checkIn && !row.checkOut && !row.isManual,
        expectedIn: workDay.expectedIn,
        expectedOut: workDay.expectedOut,
        workDay: workDay.isWorkDay,
      };
    });

    const todayRows = attendance.filter((row) => row.date.getTime() === today.getTime());
    const present = todayRows.filter((row) => String(row.status).toUpperCase() === 'PRESENT').length;
    const late = todayRows.filter((row) => String(row.status).toUpperCase() === 'LATE').length;
    const absent = todayRows.filter((row) => String(row.status).toUpperCase() === 'ABSENT').length;
    const active = todayRows.filter((row) => !!row.checkIn && !row.checkOut).length;
    const totalEmployees = employees.length;
    const openExceptions = attendance.filter((row) => String(row.status).toUpperCase() !== 'PRESENT' && String(row.status).toUpperCase() !== 'ABSENT').length;
    const pendingApprovals = bulk.filter((item) => item.status === PENDING_APPROVAL_STATUS).length;
    const totalOT = attendance.reduce((sum, row) => sum + Number(row.overtime || 0), 0);
    const pendingOT = attendance.filter((row) => overtimeDecision(row) === 'PENDING').length;
    const authorizedOT = attendance
      .filter((row) => overtimeDecision(row) === 'AUTHORIZED')
      .reduce((sum, row) => sum + Number(row.overtime || 0), 0);
    const authorizedOTAmount = Math.round((authorizedOT / 60) * overtimeRate);

    const branchGroups = new Map<string, { name: string; count: number }>();
    const deptGroups = new Map<string, { name: string; count: number }>();
    attendance.forEach((row) => {
      const employee = employeeById.get(row.employeeId);
      const branchName = employee?.branch?.name || 'Unassigned';
      const deptName = employee?.department?.name || 'Unassigned';
      branchGroups.set(branchName, { name: branchName, count: (branchGroups.get(branchName)?.count || 0) + 1 });
      deptGroups.set(deptName, { name: deptName, count: (deptGroups.get(deptName)?.count || 0) + 1 });
    });

    return {
      kpis: { totalEmployees, present, late, absent, active, openExceptions, pendingApprovals, pendingOT, totalOT, authorizedOT, authorizedOTAmount, activeGeofences: locations.length },
      overtimeSettings: {
        ratePerHour: overtimeRate,
        currency: 'TZS',
      },
      employees: employees.map((employee) => ({
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        fullName: employee.fullName || [employee.firstName, employee.lastName].filter(Boolean).join(' '),
        photoUrl: resolveUploadPath(employee.profilePhoto),
        department: employee.department?.name || 'Unassigned',
        branch: employee.branch?.name || 'Unassigned',
      })),
      records: rows,
      exceptions: this.normalizeExceptions(rows),
      approvals: bulk.map((item) => ({
        id: item.id,
        emp: item.submittedByName || item.submittedByUserId || 'Bulk submission',
        type: 'Attendance Bulk Submission',
        date: item.attendanceDate.toISOString().slice(0, 10),
        reviewer: item.approvedBy || 'Pending',
        status: item.status,
        detail: `${normalizeJson(item.payload, []).length} attendance row(s) queued`,
        submitted: item.createdAt.toISOString(),
        approvalStage: item.approvalStage,
      })),
      shifts: shifts.map((shift) => ({
        id: shift.id,
        name: shift.name,
        start: shift.startTime,
        end: shift.endTime,
        type: shift.isNightShift ? 'Night' : 'Day',
        grace: shift.breakMinutes,
        color: shift.isNightShift ? 'purple' : 'blue',
      })),
      assignments: [],
      swaps: swaps.map((swap) => ({
        id: swap.id,
        requester: swap.requester?.fullName || swap.requester?.employeeNumber || swap.requesterId,
        requestee: swap.target?.fullName || swap.target?.employeeNumber || swap.targetId,
        date: swap.requesterDate.toISOString().slice(0, 10),
        fromShift: swap.requesterDate.toISOString().slice(0, 10),
        toShift: swap.targetDate.toISOString().slice(0, 10),
        reason: swap.reason || '',
        status: swap.status,
      })),
      geofences: locations.map((location) => ({
        id: location.id,
        name: location.name,
        type: location.type || 'Branch',
        lat: Number(location.latitude || 0),
        lng: Number(location.longitude || 0),
        radius: Number(location.radiusMeters || 0),
        branches: location.metadata ? normalizeJson(location.metadata, {})?.branches || [] : [],
        status: location.isActive ? 'Active' : 'Inactive',
      })),
      overview: {
        attendanceRate: totalEmployees ? Math.round((present / Math.max(totalEmployees, 1)) * 100) : 0,
        byMethod: [
          { method: 'Manual', count: attendance.filter((row) => row.isManual).length },
          { method: 'Automated', count: attendance.filter((row) => !row.isManual).length },
        ],
        activeGeofences: locations.length,
      },
      trends: {
        punctualityByDept: [...deptGroups.values()].sort((a, b) => b.count - a.count).slice(0, 5),
        coverageByBranch: [...branchGroups.values()].sort((a, b) => b.count - a.count).slice(0, 5),
      },
      approvalFlow: approvals.find((item) => item.moduleKey === 'ATTENDANCE_BULK') || null,
      bulkSubmissions: bulk.map((item) => ({
        id: item.id,
        attendanceDate: item.attendanceDate.toISOString().slice(0, 10),
        defaultStatus: item.defaultStatus,
        status: item.status,
        notes: item.notes || '',
        approvalStage: item.approvalStage,
        rows: normalizeJson(item.payload, []),
        rowsCount: normalizeJson(item.payload, []).length,
      })),
    };
  }

  async bulkSubmit(companyId: string, body: any, user: any) {
    const approvalRequired = await hasApprovalFlow(companyId, this.prisma);
    const attendanceDate = toDateOnly(body.attendanceDate || new Date());
    if (!attendanceDate) throw new BadRequestException('Invalid attendance date');

    const existingSubmission = await this.prisma.attendanceBulkSubmission.findFirst({
      where: { companyId, attendanceDate },
      select: { id: true },
    });
    if (existingSubmission) {
      throw new BadRequestException('A bulk attendance submission already exists for this date');
    }

    const rows = Array.isArray(body.rows) ? body.rows : [];
    if (!rows.length) throw new BadRequestException('No attendance rows supplied');

    const created = await this.prisma.attendanceBulkSubmission.create({
      data: {
        companyId,
        submittedByUserId: user?.sub || null,
        submittedByName: user?.fullName || user?.name || null,
        branchId: body.branchId || null,
        departmentId: body.departmentId || null,
        attendanceDate,
        defaultStatus: String(body.defaultStatus || 'PRESENT').toUpperCase(),
        source: body.source || 'BULK',
        payload: JSON.stringify(rows),
        notes: body.notes || null,
        status: approvalRequired ? PENDING_APPROVAL_STATUS : IN_PROGRESS_STATUS,
        approvalStage: approvalRequired ? 0 : 1,
        approvalConfigKey: approvalRequired ? 'ATTENDANCE_BULK' : null,
        approvedAt: approvalRequired ? null : new Date(),
        approvedBy: approvalRequired ? null : (user?.fullName || user?.name || null),
      },
    });

    if (!approvalRequired) {
      await this.applyBulkRows(companyId, created.id, rows, attendanceDate, body);
    }

    return this.getSubmission(companyId, created.id);
  }

  async approveSubmission(companyId: string, id: string, user: any) {
    const submission = await this.prisma.attendanceBulkSubmission.findFirst({ where: { id, companyId } });
    if (!submission) throw new NotFoundException('Bulk submission not found');
    if (submission.status !== PENDING_APPROVAL_STATUS) throw new BadRequestException('Submission is not pending approval');

    await this.prisma.attendanceBulkSubmission.update({
      where: { id },
      data: { status: IN_PROGRESS_STATUS, approvalStage: 1, approvedBy: user?.fullName || user?.name || null, approvedAt: new Date() },
    });

    const rows = normalizeJson(submission.payload, []);
    await this.applyBulkRows(companyId, id, rows, submission.attendanceDate, submission);
    return this.getSubmission(companyId, id);
  }

  async updateOvertimeSettings(companyId: string, body: any) {
    const ratePerHour = Number(body?.ratePerHour ?? body?.overtimeRate ?? 0);
    if (!Number.isFinite(ratePerHour) || ratePerHour < 0) {
      throw new BadRequestException('Overtime hourly amount must be a valid number');
    }

    return this.prisma.companySettings.upsert({
      where: { companyId },
      create: {
        companyId,
        overtimeRate: String(ratePerHour),
      },
      update: {
        overtimeRate: String(ratePerHour),
      },
      select: {
        overtimeRate: true,
      },
    });
  }

  async decideOvertime(companyId: string, id: string, body: any, user: any) {
    const decision = String(body?.decision || '').trim().toUpperCase();
    if (!['AUTHORIZED', 'UNAUTHORIZED'].includes(decision)) {
      throw new BadRequestException('Decision must be AUTHORIZED or UNAUTHORIZED');
    }

    // Scope to company, then delegate to the single shared approval workflow.
    const row = await this.prisma.attendance.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!row) throw new NotFoundException('Attendance record not found');

    return this.approvals.decideOvertime(
      user?.sub || user?.id,
      id,
      decision === 'AUTHORIZED' ? 'APPROVE' : 'REJECT',
      String(body?.reason || '').trim() || undefined,
      { bypassEligibility: true }, // admin surface is permission-gated; may override/re-decide
    );
  }

  async listLocations(companyId: string) {
    return this.prisma.workspaceLocation.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } });
  }

  async updateLocation(companyId: string, id: string, body: any) {
    const existing = await this.prisma.workspaceLocation.findFirst({ where: { companyId, id } });
    if (!existing) throw new NotFoundException('Location not found');
    return this.prisma.workspaceLocation.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        code: body.code ?? existing.code,
        city: body.city ?? existing.city,
        country: body.country ?? existing.country,
        type: body.type ?? existing.type,
        address: body.address ?? existing.address,
        radiusMeters: body.radiusMeters ?? existing.radiusMeters,
        latitude: body.latitude ?? existing.latitude,
        longitude: body.longitude ?? existing.longitude,
        metadata: body.metadata ?? existing.metadata,
        isActive: body.isActive ?? existing.isActive,
      },
    });
  }

  private async applyBulkRows(companyId: string, submissionId: string, rows: any[], attendanceDate: Date, body: any) {
    const effectiveDate = attendanceDate;
    for (const row of rows) {
      if (!row?.employeeId) continue;
      const checkIn = row.checkIn ? new Date(row.checkIn) : null;
      const checkOut = row.checkOut ? new Date(row.checkOut) : null;
      const workMinutes = row.workMinutes !== undefined && row.workMinutes !== null
        ? Number(row.workMinutes)
        : checkIn && checkOut
          ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000))
          : null;
      const overtime = row.overtime !== undefined && row.overtime !== null ? Number(row.overtime) : 0;

      await this.prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: row.employeeId, date: effectiveDate } },
        create: {
          employeeId: row.employeeId,
          companyId,
          shiftId: row.shiftId || null,
          date: effectiveDate,
          checkIn,
          checkOut,
          workMinutes,
          overtime,
          status: String(row.status || body.defaultStatus || 'PRESENT').toUpperCase(),
          isManual: true,
          notes: row.notes || body.notes || null,
        },
        update: {
          shiftId: row.shiftId || null,
          checkIn,
          checkOut,
          workMinutes,
          overtime,
          status: String(row.status || body.defaultStatus || 'PRESENT').toUpperCase(),
          isManual: true,
          notes: row.notes || body.notes || null,
        },
      });
    }

    await this.prisma.attendanceBulkSubmission.update({
      where: { id: submissionId },
      data: { status: 'Approved', approvalStage: 2, approvedAt: new Date() },
    });
  }

  private async getSubmission(companyId: string, id: string) {
    const row = await this.prisma.attendanceBulkSubmission.findFirst({ where: { id, companyId } });
    if (!row) throw new NotFoundException('Bulk submission not found');
    return {
      id: row.id,
      companyId: row.companyId,
      attendanceDate: row.attendanceDate.toISOString().slice(0, 10),
      status: row.status,
      approvalStage: row.approvalStage,
      defaultStatus: row.defaultStatus,
      notes: row.notes || '',
      rows: normalizeJson(row.payload, []),
      createdAt: row.createdAt,
      approvedAt: row.approvedAt,
      approvedBy: row.approvedBy,
    };
  }

  private normalizeExceptions(rows: any[]) {
    const exceptions = rows.filter((row) => String(row.status).toUpperCase() !== 'PRESENT');
    return exceptions.slice(0, 12).map((row, index) => ({
      id: `EXC-${String(index + 1).padStart(3, '0')}`,
      emp: row.emp,
      empId: row.empId,
      type: String(row.status).toUpperCase() === 'LATE' ? 'Late Arrival' : 'Attendance Exception',
      date: row.date,
      details: row.notes || row.shift || 'Recorded from attendance',
      severity: String(row.status).toUpperCase() === 'LATE' ? 'Moderate' : 'Low',
      status: 'Open',
      flagged: row.date,
    }));
  }
}
