import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

function resolveUploadPath(fileName?: string | null) {
  if (!fileName) return '';
  const value = String(fileName).trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('/uploads/')) return value;
  return `/uploads/${value.replace(/^\/+/, '')}`;
}

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  private defaultShifts() {
    return [
      { name: 'Morning', startTime: '08:00', endTime: '17:00', type: 'Day Shift', color: 'orange', breakMinutes: 60, isNightShift: false, isActive: true },
      { name: 'Afternoon', startTime: '13:00', endTime: '22:00', type: 'Day Shift', color: 'blue', breakMinutes: 60, isNightShift: false, isActive: true },
      { name: 'Night', startTime: '22:00', endTime: '06:00', type: 'Night Shift', color: 'purple', breakMinutes: 60, isNightShift: true, isActive: true },
      { name: 'Office', startTime: '09:00', endTime: '18:00', type: 'Office', color: 'green', breakMinutes: 60, isNightShift: false, isActive: true },
    ];
  }

  private requireCompanyId(companyId?: string | null) {
    if (!companyId) throw new BadRequestException('Company not selected');
    return companyId;
  }

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

  async getAdminOverview(companyId: string, month?: number, year?: number) {
    const cid = this.requireCompanyId(companyId);
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0, 23, 59, 59);

    let shifts = await this.prisma.shift.findMany({ where: { companyId: cid }, orderBy: { name: 'asc' } });
    if (!shifts.length) {
      await this.prisma.shift.createMany({
        data: this.defaultShifts().map((shift) => ({
          companyId: cid,
          ...shift,
        })),
        skipDuplicates: true,
      });
      shifts = await this.prisma.shift.findMany({ where: { companyId: cid }, orderBy: { name: 'asc' } });
    }

    const [employees, assignmentsData, swapsData, holidays] = await Promise.all([
      this.prisma.employee.findMany({
        where: { companyId: cid, status: 'Active' },
        select: {
          id: true,
          employeeNumber: true,
          fullName: true,
          profilePhoto: true,
          department: { select: { name: true } },
          branch: { select: { name: true } },
        },
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.shiftAssignment.findMany({
        where: { employee: { companyId: cid } },
        include: {
          employee: { select: { id: true, fullName: true, employeeNumber: true, profilePhoto: true, department: { select: { name: true } }, branch: { select: { name: true } } } },
          shift: { select: { id: true, name: true, startTime: true, endTime: true, color: true, type: true, breakMinutes: true, isNightShift: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.shiftSwapRequest.findMany({
        where: { companyId: cid },
        include: {
          requester: { select: { fullName: true, employeeNumber: true, profilePhoto: true } },
          target: { select: { fullName: true, employeeNumber: true, profilePhoto: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.publicHoliday.findMany({
        where: { companyId: cid, date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: 'asc' },
      }),
    ]);

    const assignmentRows = assignmentsData.map((assignment) => ({
      id: assignment.id,
      empId: assignment.employeeId,
      emp: assignment.employee?.fullName || assignment.employee?.employeeNumber || assignment.employeeId,
      photoUrl: resolveUploadPath(assignment.employee?.profilePhoto),
      dept: assignment.employee?.department?.name || 'Unassigned',
      branch: assignment.employee?.branch?.name || 'Unassigned',
      shiftId: assignment.shiftId,
      shift: assignment.shift?.name || 'Shift',
      start: assignment.shift?.startTime || '',
      end: assignment.shift?.endTime || '',
      effective: assignment.startDate.toISOString().slice(0, 10),
      rotation: assignment.rotation || 'None',
      status: assignment.status || 'Active',
      color: assignment.shift?.color || 'gray',
      type: assignment.shift?.type || 'Day Shift',
    }));

    const patternRows = shifts.map((shift) => ({
      id: shift.id,
      name: shift.name,
      start: shift.startTime,
      end: shift.endTime,
      type: shift.type || (shift.isNightShift ? 'Night Shift' : 'Day Shift'),
      grace: shift.breakMinutes,
      color: shift.color || (shift.isNightShift ? 'purple' : 'orange'),
      isNightShift: shift.isNightShift,
      active: shift.isActive,
    }));

    const swapRows = swapsData.map((swap) => ({
      id: swap.id,
      requester: swap.requester?.fullName || swap.requester?.employeeNumber || swap.requesterId,
      requestee: swap.target?.fullName || swap.target?.employeeNumber || swap.targetId,
      requesterPhotoUrl: resolveUploadPath(swap.requester?.profilePhoto),
      requesteePhotoUrl: resolveUploadPath(swap.target?.profilePhoto),
      date: swap.requesterDate.toISOString().slice(0, 10),
      fromShift: swap.requesterDate.toISOString().slice(0, 10),
      toShift: swap.targetDate.toISOString().slice(0, 10),
      reason: swap.reason || '',
      status: swap.status,
      approvedBy: swap.approvedBy || '',
      approvedAt: swap.approvedAt || null,
    }));

    const assignedEmployeeIds = new Set(assignmentRows.map((assignment) => assignment.empId));

    return {
      employees: employees.map((employee) => ({
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        fullName: employee.fullName,
        photoUrl: resolveUploadPath(employee.profilePhoto),
        department: employee.department?.name || 'Unassigned',
        branch: employee.branch?.name || 'Unassigned',
      })),
      patterns: patternRows,
      assignments: assignmentRows,
      swaps: swapRows,
      holidays: holidays.map((holiday) => ({
        id: holiday.id,
        name: holiday.name,
        date: holiday.date.toISOString().slice(0, 10),
        isRecurring: holiday.isRecurring,
      })),
      summary: {
        shiftPatterns: patternRows.length,
        assignedEmployees: assignedEmployeeIds.size,
        unassignedEmployees: Math.max(0, employees.length - assignedEmployeeIds.size),
        pendingSwaps: swapRows.filter((swap) => String(swap.status).toUpperCase() === 'PENDING').length,
        rotatingShifts: assignmentRows.filter((assignment) => assignment.rotation && assignment.rotation !== 'None').length,
      },
    };
  }

  async createPattern(companyId: string, body: any) {
    const cid = this.requireCompanyId(companyId);
    if (!body?.name) throw new BadRequestException('name required');
    if (!body?.start || !body?.end) throw new BadRequestException('start and end required');

    const created = await this.prisma.shift.create({
      data: {
        companyId: cid,
        name: body.name,
        startTime: body.start,
        endTime: body.end,
        type: body.type || 'Day Shift',
        color: body.color || 'orange',
        breakMinutes: Number.isFinite(Number(body.grace)) ? Number(body.grace) : 60,
        isNightShift: String(body.type || '').toLowerCase().includes('night'),
        isActive: body.isActive !== undefined ? !!body.isActive : true,
      },
    });

    return created;
  }

  async updatePattern(companyId: string, id: string, body: any) {
    const cid = this.requireCompanyId(companyId);
    const existing = await this.prisma.shift.findFirst({ where: { id, companyId: cid } });
    if (!existing) throw new NotFoundException('Shift pattern not found');

    return this.prisma.shift.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        startTime: body.start ?? existing.startTime,
        endTime: body.end ?? existing.endTime,
        type: body.type ?? existing.type,
        color: body.color ?? existing.color,
        breakMinutes: body.grace !== undefined ? Number(body.grace) : existing.breakMinutes,
        isNightShift: body.isNightShift !== undefined ? !!body.isNightShift : existing.isNightShift,
        isActive: body.isActive !== undefined ? !!body.isActive : existing.isActive,
      },
    });
  }

  async createAssignment(companyId: string, body: any) {
    const cid = this.requireCompanyId(companyId);
    if (!body?.employeeId || !body?.shiftId || !body?.startDate) throw new BadRequestException('employeeId, shiftId and startDate required');

    const employee = await this.prisma.employee.findFirst({ where: { id: body.employeeId, companyId: cid } });
    if (!employee) throw new NotFoundException('Employee not found');
    const shift = await this.prisma.shift.findFirst({ where: { id: body.shiftId, companyId: cid } });
    if (!shift) throw new NotFoundException('Shift pattern not found');

    return this.prisma.shiftAssignment.create({
      data: {
        employeeId: employee.id,
        shiftId: shift.id,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        rotation: body.rotation || 'None',
        status: body.status || 'Active',
      },
    });
  }

  async updateAssignment(companyId: string, id: string, body: any) {
    const cid = this.requireCompanyId(companyId);
    const existing = await this.prisma.shiftAssignment.findFirst({ where: { id, employee: { companyId: cid } } });
    if (!existing) throw new NotFoundException('Assignment not found');

    let shiftId = existing.shiftId;
    if (body.shiftId) {
      const shift = await this.prisma.shift.findFirst({ where: { id: body.shiftId, companyId: cid } });
      if (!shift) throw new NotFoundException('Shift pattern not found');
      shiftId = shift.id;
    }

    return this.prisma.shiftAssignment.update({
      where: { id },
      data: {
        shiftId,
        startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
        endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : existing.endDate,
        rotation: body.rotation ?? existing.rotation,
        status: body.status ?? existing.status,
      },
    });
  }

  async respondToSwapAdmin(companyId: string, id: string, accept: boolean, approvedBy?: string | null) {
    const cid = this.requireCompanyId(companyId);
    const swap = await this.prisma.shiftSwapRequest.findFirst({ where: { id, companyId: cid } });
    if (!swap) throw new NotFoundException('Swap request not found');

    return this.prisma.shiftSwapRequest.update({
      where: { id },
      data: {
        status: accept ? 'ACCEPTED' : 'REJECTED',
        approvedBy: approvedBy || null,
        approvedAt: new Date(),
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
