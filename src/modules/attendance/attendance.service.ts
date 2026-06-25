import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked to this user');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  private todayDate() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  async getTodayStatus(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const today = this.todayDate();
    const record = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
      include: { shift: { select: { name: true, startTime: true, endTime: true } } },
    });
    return record ?? { status: 'NOT_CHECKED_IN', date: today };
  }

  async checkIn(userId: string) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    const today = this.todayDate();
    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });
    if (existing?.checkIn) throw new BadRequestException('Already checked in today');

    // Find current shift assignment
    const assignment = await this.prisma.shiftAssignment.findFirst({
      where: {
        employeeId,
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: { shift: true },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const status = this.determineStatus(now, assignment?.shift?.startTime);

    return this.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      create: {
        employeeId,
        companyId,
        date: today,
        checkIn: now,
        shiftId: assignment?.shiftId ?? null,
        status,
      },
      update: { checkIn: now, status },
    });
  }

  async checkOut(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const today = this.todayDate();
    const record = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });
    if (!record?.checkIn) throw new BadRequestException('You have not checked in today');
    if (record.checkOut) throw new BadRequestException('Already checked out today');

    const now = new Date();
    const workMinutes = Math.floor((now.getTime() - record.checkIn!.getTime()) / 60000);
    const standardMinutes = 8 * 60; // 8-hour standard day
    const overtime = Math.max(0, workMinutes - standardMinutes);

    return this.prisma.attendance.update({
      where: { id: record.id },
      data: { checkOut: now, workMinutes, overtime },
    });
  }

  async getMyAttendance(userId: string, month?: number, year?: number) {
    const { employeeId } = await this.resolveEmployee(userId);
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    return this.prisma.attendance.findMany({
      where: { employeeId, date: { gte: start, lte: end } },
      include: { shift: { select: { name: true, startTime: true, endTime: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async getMyAttendanceSummary(userId: string, month?: number, year?: number) {
    const records = await this.getMyAttendance(userId, month, year);
    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'PRESENT').length,
      late: records.filter((r) => r.status === 'LATE').length,
      absent: records.filter((r) => r.status === 'ABSENT').length,
      halfDay: records.filter((r) => r.status === 'HALF_DAY').length,
      onLeave: records.filter((r) => r.status === 'ON_LEAVE').length,
      totalWorkMinutes: records.reduce((acc, r) => acc + (r.workMinutes ?? 0), 0),
      totalOvertime: records.reduce((acc, r) => acc + r.overtime, 0),
    };
    return { summary, records };
  }

  // Manager: team attendance
  async getTeamAttendance(userId: string, date?: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const directReports = await this.prisma.employee.findMany({
      where: { managerId: employeeId },
      select: { id: true },
    });
    const reportIds = directReports.map((r) => r.id);
    const targetDate = date ? new Date(date) : this.todayDate();
    targetDate.setHours(0, 0, 0, 0);

    return this.prisma.attendance.findMany({
      where: { employeeId: { in: reportIds }, date: targetDate },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            user: { select: { fullName: true } },
          },
        },
      },
    });
  }

  private determineStatus(checkInTime: Date, shiftStart?: string): string {
    if (!shiftStart) return 'PRESENT';
    const [h, m] = shiftStart.split(':').map(Number);
    const shiftStartMs = h * 60 + m;
    const checkinMs = checkInTime.getHours() * 60 + checkInTime.getMinutes();
    const diff = checkinMs - shiftStartMs;
    if (diff > 15) return 'LATE';
    return 'PRESENT';
  }
}
