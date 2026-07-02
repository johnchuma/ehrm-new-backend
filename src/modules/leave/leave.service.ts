import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApprovalsService } from '../approvals/approvals.service';

const PENDING_APPROVAL_STATUS = 'PENDING';
const APPROVED_STATUS = 'APPROVED';
const LEAVE_APPROVAL_MODULE = 'LEAVE';

async function hasApprovalFlow(companyId: string, prisma: PrismaService) {
  const cfg = await prisma.workspaceApprovalConfig.findFirst({
    where: { companyId, moduleKey: LEAVE_APPROVAL_MODULE, isActive: true },
  });
  return !!cfg;
}

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalsService,
  ) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked to this user');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  // ── Leave Types ──

  async getLeaveTypes(userId: string) {
    const { companyId } = await this.resolveEmployee(userId);
    return this.prisma.leaveType.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // ── My Balances ──

  async getMyBalances(userId: string) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    const year = new Date().getFullYear();
    const balances = await this.prisma.leaveBalance.findMany({
      where: { employeeId, year },
      include: { leaveType: true },
    });
    // Auto-init missing balances from leave types
    const types = await this.prisma.leaveType.findMany({ where: { companyId, isActive: true } });
    const existing = new Set(balances.map((b) => b.leaveTypeId));
    const missing = types.filter((t) => !existing.has(t.id));
    if (missing.length > 0) {
      await this.prisma.leaveBalance.createMany({
        data: missing.map((t) => ({
          employeeId,
          companyId,
          leaveTypeId: t.id,
          year,
          totalDays: t.daysPerYear,
          usedDays: 0,
          pendingDays: 0,
          carriedOver: 0,
        })),
        skipDuplicates: true,
      });
      return this.prisma.leaveBalance.findMany({
        where: { employeeId, year },
        include: { leaveType: true },
      });
    }
    return balances;
  }

  // ── My Applications ──

  async getMyApplications(userId: string, status?: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const requests = await this.prisma.leaveRequest.findMany({
      where: { employeeId, ...(status ? { status } : {}) },
      include: { leaveType: { select: { name: true, code: true, isPaid: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return this.attachApprovers(requests);
  }

  /** Dereference approverId → approver name so the portal can show who acted. */
  private async attachApprovers<T extends { approverId: string | null }>(requests: T[]) {
    const approverIds = [...new Set(requests.map((r) => r.approverId).filter(Boolean))] as string[];
    if (!approverIds.length) return requests.map((r) => ({ ...r, approver: null }));
    const approvers = await this.prisma.employee.findMany({
      where: { id: { in: approverIds } },
      select: { id: true, firstName: true, lastName: true, user: { select: { fullName: true } } },
    });
    const nameById = new Map(
      approvers.map((a) => [
        a.id,
        a.user?.fullName || `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() || null,
      ]),
    );
    return requests.map((r) => ({
      ...r,
      approver: r.approverId ? { id: r.approverId, name: nameById.get(r.approverId) ?? null } : null,
    }));
  }

  /** Self-service balance lookup by employeeId (portal passes the caller's own id). */
  async getBalancesFor(userId: string, employeeId: string) {
    const { employeeId: ownId } = await this.resolveEmployee(userId);
    if (employeeId && employeeId !== ownId) {
      throw new ForbiddenException('You can only view your own leave balance');
    }
    return this.getMyBalances(userId);
  }

  // ── Apply for Leave ──

  async applyLeave(userId: string, dto: ApplyLeaveDto) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    // The portal frontend sends `leaveCategoryId`; the admin/API path sends `leaveTypeId`.
    const leaveTypeId = dto.leaveTypeId ?? dto.leaveCategoryId;
    if (!leaveTypeId) throw new BadRequestException('A leave type is required');
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id: leaveTypeId, companyId, isActive: true },
    });
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start) throw new BadRequestException('End date must be after start date');

    const totalDays = this.calculateWorkingDays(start, end);
    const approvalRequired = await hasApprovalFlow(companyId, this.prisma) || leaveType.requiresApproval;

    // Check for overlapping pending/approved leaves
    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });
    if (overlap) throw new BadRequestException('You already have a leave request overlapping these dates');

    // Check balance
    const year = start.getFullYear();
    const balance = await this.prisma.leaveBalance.findFirst({
      where: { employeeId, leaveTypeId, year },
    });
    const available = balance
      ? Number(balance.totalDays) + Number(balance.carriedOver) - Number(balance.usedDays) - Number(balance.pendingDays)
      : leaveType.daysPerYear;
    if (totalDays > available) throw new BadRequestException(`Insufficient leave balance. Available: ${available} days`);

    const status = approvalRequired ? PENDING_APPROVAL_STATUS : APPROVED_STATUS;

    const [request] = await this.prisma.$transaction([
      this.prisma.leaveRequest.create({
        data: {
          employeeId,
          companyId,
          leaveTypeId,
          startDate: start,
          endDate: end,
          totalDays,
          reason: dto.reason,
          handoverNotes: dto.handoverNotes,
          sickLeaveSubCategory: dto.sickLeaveSubCategory ?? undefined,
          status,
          approvalStage: approvalRequired ? 0 : 1,
          approvalConfigKey: approvalRequired ? LEAVE_APPROVAL_MODULE : null,
          approvedAt: approvalRequired ? null : new Date(),
        },
        include: { leaveType: { select: { name: true, code: true } } },
      }),
      this.prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year },
        },
        create: {
          employeeId,
          companyId,
          leaveTypeId,
          year,
          totalDays: leaveType.daysPerYear,
          usedDays: approvalRequired ? 0 : totalDays,
          pendingDays: approvalRequired ? totalDays : 0,
          carriedOver: 0,
        },
        update: approvalRequired
          ? { pendingDays: { increment: totalDays } }
          : { usedDays: { increment: totalDays } },
      }),
    ]);

    // The record's own status=PENDING + approvalStage=0 IS the approval task —
    // it surfaces in approvers' /approvals/my-tasks. No separate row is created.
    return request;
  }

  // ── Cancel Leave ──

  async cancelLeave(userId: string, requestId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id: requestId, employeeId },
    });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Only pending requests can be cancelled');

    const year = request.startDate.getFullYear();
    await this.prisma.$transaction([
      this.prisma.leaveRequest.update({
        where: { id: requestId },
        data: { status: 'CANCELLED', approvalStage: Math.max(request.approvalStage, 1) },
      }),
      this.prisma.leaveBalance.updateMany({
        where: { employeeId, leaveTypeId: request.leaveTypeId, year },
        data: { pendingDays: { decrement: Number(request.totalDays) } },
      }),
    ]);
    return { message: 'Leave request cancelled' };
  }

  // ── Manager: Team Leave Requests ──

  async getTeamLeaveRequests(userId: string, status?: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const directReports = await this.prisma.employee.findMany({
      where: { managerId: employeeId },
      select: { id: true },
    });
    const reportIds = directReports.map((r) => r.id);
    return this.prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: reportIds },
        ...(status ? { status } : {}),
      },
      include: {
        leaveType: { select: { name: true, code: true } },
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            user: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveLeave(userId: string, requestId: string, action: 'APPROVED' | 'REJECTED', reason?: string) {
    // Manager self-service path — delegate to the single shared workflow. The
    // reporting manager satisfies eligibility for a manager step; a configured
    // multi-level flow advances the stage instead of finalizing.
    const decision = action === 'APPROVED' ? 'APPROVE' : 'REJECT';
    return this.approvals.decideLeave(userId, requestId, decision, reason);
  }

  private calculateWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }
}

export interface ApplyLeaveDto {
  /** Preferred field. The portal frontend sends `leaveCategoryId` instead. */
  leaveTypeId?: string;
  leaveCategoryId?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  handoverNotes?: string;
  /** Accepted for SICK leave; persisted once a schema column is added. */
  sickLeaveSubCategory?: string;
}
