import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  async getMySchedule(userId: string, month?: number, year?: number) {
    const { employeeId } = await this.resolveEmployee(userId);
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);

    const [assignments, attendance, holidays, leaveRequests] = await Promise.all([
      this.prisma.shiftAssignment.findMany({
        where: {
          employeeId,
          startDate: { lte: end },
          OR: [{ endDate: null }, { endDate: { gte: start } }],
        },
        include: { shift: true },
      }),
      this.prisma.attendance.findMany({
        where: { employeeId, date: { gte: start, lte: end } },
        select: { date: true, status: true, checkIn: true, checkOut: true },
      }),
      this.prisma.publicHoliday.findFirst({
        where: { companyId: (await this.resolveEmployee(userId)).companyId },
      }).then(() =>
        this.prisma.publicHoliday.findMany({
          where: { date: { gte: start, lte: end } },
          select: { date: true, name: true },
        }),
      ),
      this.prisma.leaveRequest.findMany({
        where: {
          employeeId,
          status: { in: ['APPROVED', 'PENDING'] },
          startDate: { lte: end },
          endDate: { gte: start },
        },
        select: { startDate: true, endDate: true, status: true, leaveType: { select: { name: true } } },
      }),
    ]);

    return { assignments, attendance, holidays, leaveRequests };
  }

  async getPublicHolidays(userId: string, year?: number) {
    const { companyId } = await this.resolveEmployee(userId);
    const y = year ?? new Date().getFullYear();
    return this.prisma.publicHoliday.findMany({
      where: {
        companyId,
        date: { gte: new Date(y, 0, 1), lte: new Date(y, 11, 31) },
      },
      orderBy: { date: 'asc' },
    });
  }

  async requestSwap(userId: string, dto: SwapRequestDto) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    const targetEmployee = await this.prisma.employee.findFirst({
      where: { id: dto.targetEmployeeId, companyId },
    });
    if (!targetEmployee) throw new NotFoundException('Target employee not found');
    if (dto.targetEmployeeId === employeeId) throw new BadRequestException('Cannot swap with yourself');

    return this.prisma.shiftSwapRequest.create({
      data: {
        requesterId: employeeId,
        targetId: dto.targetEmployeeId,
        companyId,
        requesterDate: new Date(dto.myDate),
        targetDate: new Date(dto.theirDate),
        reason: dto.reason,
        status: 'PENDING',
      },
    });
  }

  async getMySwapRequests(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.shiftSwapRequest.findMany({
      where: { OR: [{ requesterId: employeeId }, { targetId: employeeId }] },
      include: {
        requester: { select: { user: { select: { fullName: true } } } },
        target: { select: { user: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondToSwap(userId: string, swapId: string, accept: boolean) {
    const { employeeId } = await this.resolveEmployee(userId);
    const swap = await this.prisma.shiftSwapRequest.findFirst({
      where: { id: swapId, targetId: employeeId, status: 'PENDING' },
    });
    if (!swap) throw new NotFoundException('Swap request not found or already processed');
    return this.prisma.shiftSwapRequest.update({
      where: { id: swapId },
      data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
    });
  }
}

export interface SwapRequestDto {
  targetEmployeeId: string;
  myDate: string;       // ISO date of my shift to swap
  theirDate: string;    // ISO date of their shift I want
  reason?: string;
}
