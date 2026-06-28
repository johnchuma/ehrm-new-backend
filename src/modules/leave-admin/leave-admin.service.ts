import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const PENDING_APPROVAL_STATUS = 'PENDING';
const APPROVED_STATUS = 'APPROVED';
const REJECTED_STATUS = 'REJECTED';
const LEAVE_APPROVAL_MODULE = 'LEAVE';

function toDateOnly(value: any) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toKey(value: Date | string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function deriveCode(name: string) {
  return String(name || 'LEAVE')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 12) || 'LEAVE';
}

function buildLeaveTypeCode(baseCode: string, suffix: number) {
  if (suffix <= 1) return baseCode;

  const suffixText = `_${suffix}`;
  const maxBaseLength = Math.max(1, 12 - suffixText.length);
  return `${baseCode.slice(0, maxBaseLength)}${suffixText}`;
}

async function hasApprovalFlow(companyId: string, prisma: PrismaService) {
  const cfg = await prisma.workspaceApprovalConfig.findFirst({
    where: { companyId, moduleKey: LEAVE_APPROVAL_MODULE, isActive: true },
  });
  return cfg || null;
}

@Injectable()
export class LeaveAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(companyId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();
    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    const todayKey = toKey(new Date());

    const [requests, leaveTypes, balances, employees, approvalConfig] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where: { companyId },
        include: {
          leaveType: { select: { id: true, name: true, code: true, isPaid: true, requiresApproval: true } },
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              fullName: true,
              department: { select: { name: true } },
              branch: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leaveType.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.leaveBalance.findMany({
        where: { companyId },
        include: {
          leaveType: { select: { name: true, code: true } },
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              fullName: true,
              department: { select: { name: true } },
              branch: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.employee.findMany({
        where: { companyId, status: 'Active' },
        select: {
          id: true,
          employeeNumber: true,
          fullName: true,
          department: { select: { name: true } },
          branch: { select: { name: true } },
        },
      }),
      hasApprovalFlow(companyId, this.prisma),
    ]);

    const onLeaveToday = requests.filter((request) => {
      const start = toKey(request.startDate);
      const end = toKey(request.endDate);
      return request.status === APPROVED_STATUS && start <= todayKey && end >= todayKey;
    }).length;

    const pendingApplications = requests.filter((request) => request.status === PENDING_APPROVAL_STATUS).length;
    const approvedApplications = requests.filter((request) => request.status === APPROVED_STATUS).length;
    const rejectedApplications = requests.filter((request) => request.status === REJECTED_STATUS).length;
    const totalDays = requests.reduce((sum, request) => sum + Number(request.totalDays || 0), 0);
    const leaveLiability = balances.reduce((sum, balance) => sum + Number(balance.totalDays || 0) - Number(balance.usedDays || 0), 0);
    const encashmentExposure = balances.reduce((sum, balance) => sum + Math.max(0, Number(balance.totalDays || 0) - Number(balance.usedDays || 0) - Number(balance.pendingDays || 0)), 0);

    const deptCoverage = new Map<string, { dept: string; employees: number; onLeave: number }>();
    employees.forEach((employee) => {
      const dept = employee.department?.name || 'Unassigned';
      const current = deptCoverage.get(dept) || { dept, employees: 0, onLeave: 0 };
      current.employees += 1;
      deptCoverage.set(dept, current);
    });
    requests.forEach((request) => {
      if (request.status !== APPROVED_STATUS) return;
      const dept = request.employee?.department?.name || 'Unassigned';
      const current = deptCoverage.get(dept) || { dept, employees: 0, onLeave: 0 };
      current.onLeave += 1;
      deptCoverage.set(dept, current);
    });

    const coverage = [...deptCoverage.values()].map((item) => ({
      dept: item.dept,
      employees: item.employees,
      onLeave: item.onLeave,
      coverageRate: item.employees ? Math.max(0, Math.round(((item.employees - item.onLeave) / item.employees) * 100)) : 0,
    })).sort((a, b) => a.dept.localeCompare(b.dept));

    const requestsByType = new Map<string, number>();
    requests.forEach((request) => {
      const type = request.leaveType?.name || 'Leave';
      requestsByType.set(type, (requestsByType.get(type) || 0) + 1);
    });

    const requestsByDept = new Map<string, number>();
    requests.forEach((request) => {
      const dept = request.employee?.department?.name || 'Unassigned';
      requestsByDept.set(dept, (requestsByDept.get(dept) || 0) + 1);
    });

    const requestRows = requests.map((request) => ({
      id: request.id,
      emp: request.employee?.fullName || request.employee?.employeeNumber || request.employeeId,
      employeeId: request.employeeId,
      dept: request.employee?.department?.name || 'Unassigned',
      branch: request.employee?.branch?.name || 'Unassigned',
      type: request.leaveType?.name || 'Leave',
      from: toKey(request.startDate),
      to: toKey(request.endDate),
      days: Number(request.totalDays || 0),
      reason: request.reason || '',
      status: request.status,
      approver: request.approverId || '',
      approvedAt: request.approvedAt || null,
      rejectionReason: request.rejectionReason || '',
      approvalStage: request.approvalStage || 0,
      approvalConfigKey: request.approvalConfigKey || null,
    }));

    const approvals = requestRows.filter((row) => row.status === PENDING_APPROVAL_STATUS);

    const leaveTypeRows = leaveTypes.map((type) => ({
      id: type.id,
      name: type.name,
      code: type.code,
      days: type.daysPerYear,
      isPaid: type.isPaid,
      requiresApproval: type.requiresApproval,
      status: type.isActive ? 'Active' : 'Inactive',
    }));

    const balanceRows = balances.map((balance) => ({
      id: balance.id,
      employee: balance.employee?.fullName || balance.employee?.employeeNumber || balance.employeeId,
      department: balance.employee?.department?.name || 'Unassigned',
      branch: balance.employee?.branch?.name || 'Unassigned',
      type: balance.leaveType?.name || 'Leave',
      year: balance.year,
      totalDays: Number(balance.totalDays || 0),
      usedDays: Number(balance.usedDays || 0),
      pendingDays: Number(balance.pendingDays || 0),
      carryOver: Number(balance.carriedOver || 0),
      available: Math.max(0, Number(balance.totalDays || 0) + Number(balance.carriedOver || 0) - Number(balance.usedDays || 0) - Number(balance.pendingDays || 0)),
    }));

    const monthRows = requestRows.filter((row) => row.from >= toKey(monthStart) && row.from <= toKey(monthEnd));
    const monthlyCoverage = coverage
      .map((row) => ({ name: row.dept, count: row.coverageRate }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const annualTotals = new Array(12).fill(0).map((_, index) => {
      const monthKey = String(index + 1).padStart(2, '0');
      return requestRows.filter((row) => row.from.slice(5, 7) === monthKey && row.status === APPROVED_STATUS).reduce((sum, row) => sum + row.days, 0);
    });

    const blackoutCandidates = Object.entries(
      monthRows.reduce<Record<string, number>>((acc, row) => {
        acc[row.from] = (acc[row.from] || 0) + 1;
        return acc;
      }, {}),
    )
      .filter(([, count]) => count >= 3)
      .map(([date, count], index) => ({
        id: `BP-${String(index + 1).padStart(3, '0')}`,
        name: `Heavy leave day ${date}`,
        start: date,
        end: date,
        scope: 'Department',
        depts: [],
        reason: `${count} leave applications overlap`,
        conflicts: count,
      }));

    const holidays = [
      { date: '2026-01-01', name: "New Year's Day", type: 'National' },
      { date: '2026-04-26', name: 'Union Day', type: 'National' },
      { date: '2026-05-01', name: 'Workers Day', type: 'National' },
      { date: '2026-07-07', name: 'Saba Saba', type: 'National' },
      { date: '2026-08-08', name: 'Nane Nane', type: 'National' },
      { date: '2026-12-25', name: 'Christmas Day', type: 'National' },
    ];

    return {
      kpis: {
        totalApplications: requests.length,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        onLeaveToday,
        leaveLiability,
        encashmentExposure,
        utilization: totalDays ? Math.round((approvedApplications / Math.max(requests.length, 1)) * 100) : 0,
        activeTypes: leaveTypes.length,
      },
      approvalFlow: approvalConfig
        ? {
            moduleKey: approvalConfig.moduleKey,
            process: approvalConfig.process || 'Leave approval workflow',
            approvalMode: approvalConfig.approvalMode,
            levels: approvalConfig.levels,
            initiators: approvalConfig.initiators || null,
            reviewers: approvalConfig.reviewers || null,
            approvers: approvalConfig.approvers || null,
          }
        : null,
      requests: requestRows,
      approvals,
      leaveTypes: leaveTypeRows,
      balances: balanceRows,
      liabilities: balanceRows.map((row) => ({
        id: row.id,
        employee: row.employee,
        department: row.department,
        type: row.type,
        liability: Math.max(0, row.totalDays - row.usedDays),
        encashmentExposure: Math.max(0, row.available),
        headcount: 1,
      })),
      planning: annualTotals.map((days, index) => ({ month: index + 1, name: new Date(targetYear, index, 1).toLocaleString('en-US', { month: 'short' }), days })),
      blackoutPeriods: blackoutCandidates,
      holidays,
      coverage,
      analytics: {
        requestsByType: [...requestsByType.entries()].map(([name, count]) => ({ name, count })),
        requestsByDept: [...requestsByDept.entries()].map(([name, count]) => ({ name, count })),
        monthlyApprovals: annualTotals,
      },
      aiSignals: [
        { id: 'LEAVE-AI-01', signal: 'High leave concentration detected', entity: `${approvals.length} pending leave requests`, confidence: 87, action: 'Review approval queue and coverage impact' },
        { id: 'LEAVE-AI-02', signal: 'Department coverage risk', entity: coverage.filter((row) => row.coverageRate < 70).map((row) => row.dept).join(', ') || 'No critical departments', confidence: 81, action: 'Stagger leave dates or backfill coverage' },
        { id: 'LEAVE-AI-03', signal: 'Encashment exposure elevated', entity: `TZS ${Math.round(encashmentExposure).toLocaleString()}`, confidence: 74, action: 'Prioritize encashment review for surplus balances' },
      ],
    };
  }

  async createLeaveType(companyId: string, body: any) {
    if (!body?.name) throw new BadRequestException('name required');
    const days = Number(body.daysPerYear ?? body.days ?? 0);
    if (!Number.isFinite(days) || days <= 0) throw new BadRequestException('daysPerYear required');

    const baseCode = deriveCode(body.code || body.name);
    let code = baseCode;
    let suffix = 1;

    while (await this.prisma.leaveType.findFirst({ where: { companyId, code } })) {
      suffix += 1;
      code = buildLeaveTypeCode(baseCode, suffix);
    }

    const created = await this.prisma.leaveType.create({
      data: {
        companyId,
        name: body.name,
        code,
        daysPerYear: days,
        isPaid: body.isPaid !== undefined ? !!body.isPaid : true,
        requiresApproval: body.requiresApproval !== undefined ? !!body.requiresApproval : true,
        gender: body.gender || null,
        minServiceDays: body.minServiceDays !== undefined && body.minServiceDays !== null ? Number(body.minServiceDays) : 0,
        isActive: body.isActive !== undefined ? !!body.isActive : true,
      },
    });

    return {
      id: created.id,
      name: created.name,
      code: created.code,
      days: created.daysPerYear,
      isPaid: created.isPaid,
      requiresApproval: created.requiresApproval,
      status: created.isActive ? 'Active' : 'Inactive',
    };
  }

  async updateLeaveType(companyId: string, id: string, body: any) {
    const existing = await this.prisma.leaveType.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Leave type not found');

    const updated = await this.prisma.leaveType.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        code: body.code ?? existing.code,
        daysPerYear: body.daysPerYear !== undefined ? Number(body.daysPerYear) : existing.daysPerYear,
        isPaid: body.isPaid !== undefined ? !!body.isPaid : existing.isPaid,
        requiresApproval: body.requiresApproval !== undefined ? !!body.requiresApproval : existing.requiresApproval,
        gender: body.gender !== undefined ? body.gender : existing.gender,
        minServiceDays: body.minServiceDays !== undefined ? Number(body.minServiceDays) : existing.minServiceDays,
        isActive: body.isActive !== undefined ? !!body.isActive : existing.isActive,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      days: updated.daysPerYear,
      isPaid: updated.isPaid,
      requiresApproval: updated.requiresApproval,
      status: updated.isActive ? 'Active' : 'Inactive',
    };
  }

  async respond(companyId: string, requestId: string, body: { action: 'APPROVED' | 'REJECTED'; reason?: string }, actor?: any) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id: requestId, companyId },
      include: { leaveType: true },
    });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== PENDING_APPROVAL_STATUS) throw new BadRequestException('Request is not pending approval');

    const year = request.startDate.getFullYear();
    await this.prisma.$transaction([
      this.prisma.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: body.action,
          approverId: actor?.sub || actor?.id || null,
          approvalStage: 1,
          approvedAt: body.action === APPROVED_STATUS ? new Date() : undefined,
          rejectionReason: body.action === REJECTED_STATUS ? body.reason || null : null,
        },
      }),
      this.prisma.leaveBalance.updateMany({
        where: { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year },
        data: body.action === APPROVED_STATUS
          ? { usedDays: { increment: Number(request.totalDays) }, pendingDays: { decrement: Number(request.totalDays) } }
          : { pendingDays: { decrement: Number(request.totalDays) } },
      }),
    ]);

    return { message: body.action === APPROVED_STATUS ? 'Leave request approved' : 'Leave request rejected' };
  }
}