import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const PENDING_APPROVAL_STATUS = 'Pending Approval';
const IN_PROGRESS_STATUS = 'In Progress';

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

async function hasApprovalFlow(companyId: string, prisma: PrismaService) {
  const cfg = await prisma.workspaceApprovalConfig.findFirst({
    where: { companyId, moduleKey: 'ATTENDANCE_BULK', isActive: true },
  });
  return !!cfg;
}

@Injectable()
export class AttendanceAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(companyId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();
    const start = new Date(targetYear, targetMonth - 1, 1);
    const end = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [attendance, employees, shifts, locations, approvals, swaps, bulk] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { companyId, date: { gte: start, lte: end } },
        include: {
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              fullName: true,
              department: { select: { name: true } },
              branch: { select: { name: true } },
            },
          },
          shift: { select: { id: true, name: true, startTime: true, endTime: true } },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.employee.findMany({
        where: { companyId, status: 'Active' },
        select: {
          id: true,
          employeeNumber: true,
          fullName: true,
          firstName: true,
          lastName: true,
          department: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
        orderBy: { fullName: 'asc' },
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

    const rows = attendance.map((row) => ({
      id: row.id,
      empId: row.employeeId,
      emp: row.employee?.fullName || row.employee?.employeeNumber || row.employeeId,
      dept: row.employee?.department?.name || 'Unassigned',
      branch: row.employee?.branch?.name || 'Unassigned',
      date: row.date.toISOString().slice(0, 10),
      in: row.checkIn ? row.checkIn.toISOString() : '',
      out: row.checkOut ? row.checkOut.toISOString() : '',
      hours: row.workMinutes ? Number((row.workMinutes / 60).toFixed(2)) : 0,
      method: row.isManual ? 'Manual' : 'Auto',
      status: row.status,
      notes: row.notes || '',
      shift: row.shift?.name || '',
    }));

    const todayRows = attendance.filter((row) => row.date.getTime() === today.getTime());
    const present = todayRows.filter((row) => String(row.status).toUpperCase() === 'PRESENT').length;
    const late = todayRows.filter((row) => String(row.status).toUpperCase() === 'LATE').length;
    const absent = todayRows.filter((row) => String(row.status).toUpperCase() === 'ABSENT').length;
    const active = todayRows.filter((row) => !!row.checkIn && !row.checkOut).length;
    const totalEmployees = employees.length;
    const openExceptions = attendance.filter((row) => String(row.status).toUpperCase() !== 'PRESENT' && String(row.status).toUpperCase() !== 'ABSENT').length;
    const pendingApprovals = bulk.filter((item) => item.status === PENDING_APPROVAL_STATUS).length;
    const totalOT = attendance.reduce((sum, row) => sum + Number(row.overtime || 0), 0);
    const pendingOT = attendance.filter((row) => Number(row.overtime || 0) > 0 && !row.approvedBy).length;

    const branchGroups = new Map<string, { name: string; count: number }>();
    const deptGroups = new Map<string, { name: string; count: number }>();
    attendance.forEach((row) => {
      const branchName = row.employee?.branch?.name || 'Unassigned';
      const deptName = row.employee?.department?.name || 'Unassigned';
      branchGroups.set(branchName, { name: branchName, count: (branchGroups.get(branchName)?.count || 0) + 1 });
      deptGroups.set(deptName, { name: deptName, count: (deptGroups.get(deptName)?.count || 0) + 1 });
    });

    return {
      kpis: { totalEmployees, present, late, absent, active, openExceptions, pendingApprovals, pendingOT, totalOT, activeGeofences: locations.length },
      employees: employees.map((employee) => ({
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        fullName: employee.fullName || [employee.firstName, employee.lastName].filter(Boolean).join(' '),
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
        rowsCount: normalizeJson(item.payload, []).length,
      })),
    };
  }

  async bulkSubmit(companyId: string, body: any, user: any) {
    const approvalRequired = await hasApprovalFlow(companyId, this.prisma);
    const attendanceDate = toDateOnly(body.attendanceDate || new Date());
    if (!attendanceDate) throw new BadRequestException('Invalid attendance date');

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