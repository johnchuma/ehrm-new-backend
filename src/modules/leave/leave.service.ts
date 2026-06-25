import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.leaveRequest.findMany({
      where: { employeeId, ...(status ? { status } : {}) },
      include: { leaveType: { select: { name: true, code: true, isPaid: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Apply for Leave ──

  async applyLeave(userId: string, dto: ApplyLeaveDto) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id: dto.leaveTypeId, companyId, isActive: true },
    });
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start) throw new BadRequestException('End date must be after start date');

    const totalDays = this.calculateWorkingDays(start, end);

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
      where: { employeeId, leaveTypeId: dto.leaveTypeId, year },
    });
    const available = balance
      ? Number(balance.totalDays) + Number(balance.carriedOver) - Number(balance.usedDays) - Number(balance.pendingDays)
      : leaveType.daysPerYear;
    if (totalDays > available) throw new BadRequestException(`Insufficient leave balance. Available: ${available} days`);

    const [request] = await this.prisma.$transaction([
      this.prisma.leaveRequest.create({
        data: {
          employeeId,
          companyId,
          leaveTypeId: dto.leaveTypeId,
          startDate: start,
          endDate: end,
          totalDays,
          reason: dto.reason,
          handoverNotes: dto.handoverNotes,
          status: leaveType.requiresApproval ? 'PENDING' : 'APPROVED',
        },
        include: { leaveType: { select: { name: true, code: true } } },
      }),
      this.prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: { employeeId, leaveTypeId: dto.leaveTypeId, year },
        },
        create: {
          employeeId,
          companyId,
          leaveTypeId: dto.leaveTypeId,
          year,
          totalDays: leaveType.daysPerYear,
          usedDays: 0,
          pendingDays: totalDays,
          carriedOver: 0,
        },
        update: { pendingDays: { increment: totalDays } },
      }),
    ]);
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
        data: { status: 'CANCELLED' },
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
    const { employeeId } = await this.resolveEmployee(userId);
    const request = await this.prisma.leaveRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is no longer pending');

    // Verify requester is the manager of the employee
    const targetEmployee = await this.prisma.employee.findUnique({
      where: { id: request.employeeId },
      select: { managerId: true },
    });
    if (targetEmployee?.managerId !== employeeId)
      throw new ForbiddenException('You are not the manager of this employee');

    const year = request.startDate.getFullYear();
    const updates: any[] = [
      this.prisma.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: action,
          approverId: employeeId,
          approvedAt: action === 'APPROVED' ? new Date() : undefined,
          rejectionReason: action === 'REJECTED' ? reason : undefined,
        },
      }),
    ];

    if (action === 'APPROVED') {
      updates.push(
        this.prisma.leaveBalance.updateMany({
          where: { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year },
          data: {
            usedDays: { increment: Number(request.totalDays) },
            pendingDays: { decrement: Number(request.totalDays) },
          },
        }),
      );
    } else {
      updates.push(
        this.prisma.leaveBalance.updateMany({
          where: { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year },
          data: { pendingDays: { decrement: Number(request.totalDays) } },
        }),
      );
    }

    const [updated] = await this.prisma.$transaction(updates);
    return updated;
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
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  handoverNotes?: string;
}
