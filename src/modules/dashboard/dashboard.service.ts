import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployeeDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true, fullName: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked');
    const { employeeId, companyId } = user;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStart = new Date(year, now.getMonth(), 1);
    const monthEnd = new Date(year, now.getMonth() + 1, 0, 23, 59, 59);

    const [
      employee,
      todayAttendance,
      leaveBalances,
      pendingLeave,
      monthAttendance,
      unreadNotifications,
      pendingTasks,
      upcomingTrainings,
      pendingExpenses,
      recentAnnouncements,
      activeReview,
    ] = await Promise.all([
      this.prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
          employeeNumber: true,
          jobTitle: true,
          startDate: true,
          department: { select: { name: true } },
          branch: { select: { name: true } },
        },
      }),
      this.prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId, date: today } },
        select: { checkIn: true, checkOut: true, status: true, workMinutes: true },
      }),
      this.prisma.leaveBalance.findMany({
        where: { employeeId, year },
        include: { leaveType: { select: { name: true, code: true } } },
      }),
      this.prisma.leaveRequest.count({
        where: { employeeId, status: 'PENDING' },
      }),
      this.prisma.attendance.findMany({
        where: { employeeId, date: { gte: monthStart, lte: monthEnd } },
        select: { status: true, workMinutes: true },
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
      this.prisma.task.count({
        where: { assigneeId: userId, status: { in: ['TODO', 'IN_PROGRESS'] } },
      }),
      this.prisma.trainingEnrollment.findMany({
        where: { employeeId, status: { in: ['ENROLLED', 'IN_PROGRESS'] } },
        include: { training: { select: { title: true, startDate: true, endDate: true, isMandatory: true } } },
        take: 3,
        orderBy: { enrolledAt: 'asc' },
      }),
      this.prisma.expenseClaim.count({ where: { employeeId, status: 'PENDING' } }),
      this.prisma.announcement.findMany({
        where: {
          companyId,
          publishedAt: { lte: now },
          OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
          targetAudience: 'ALL',
        },
        orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
        take: 3,
        select: { id: true, title: true, type: true, pinned: true, publishedAt: true },
      }),
      this.prisma.performanceReview.findFirst({
        where: { employeeId, status: { in: ['PENDING', 'SELF_REVIEW'] } },
        select: { id: true, period: true, status: true, endDate: true },
        orderBy: { endDate: 'asc' },
      }),
    ]);

    const attendanceSummary = {
      present: monthAttendance.filter((a) => a.status === 'PRESENT').length,
      late: monthAttendance.filter((a) => a.status === 'LATE').length,
      absent: monthAttendance.filter((a) => a.status === 'ABSENT').length,
      onLeave: monthAttendance.filter((a) => a.status === 'ON_LEAVE').length,
      totalDays: monthAttendance.length,
      totalWorkHours: Math.round(monthAttendance.reduce((s, a) => s + (a.workMinutes ?? 0), 0) / 60),
    };

    const leaveSnapshot = leaveBalances.map((b) => ({
      type: b.leaveType.name,
      code: b.leaveType.code,
      available: Math.max(0, Number(b.totalDays) + Number(b.carriedOver) - Number(b.usedDays) - Number(b.pendingDays)),
      used: Number(b.usedDays),
      total: Number(b.totalDays) + Number(b.carriedOver),
    }));

    return {
      profile: { ...employee, fullName: user.fullName },
      today: {
        attendance: todayAttendance,
        date: today,
      },
      attendance: attendanceSummary,
      leave: {
        balances: leaveSnapshot,
        pendingApplications: pendingLeave,
      },
      pendingTasks,
      unreadNotifications,
      pendingExpenses,
      upcomingTrainings,
      recentAnnouncements,
      activeReview,
    };
  }

  // Company-wide directory (search employees by name/department)
  async getDirectory(companyId: string, search?: string, departmentId?: string) {
    return this.prisma.employee.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
        ...(departmentId ? { departmentId } : {}),
        ...(search
          ? {
              user: {
                fullName: { contains: search },
              },
            }
          : {}),
      },
      select: {
        id: true,
        employeeNumber: true,
        jobTitle: true,
        department: { select: { name: true } },
        branch: { select: { name: true } },
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { user: { fullName: 'asc' } },
      take: 50,
    });
  }
}
