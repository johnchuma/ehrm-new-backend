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

  // Company-wide overview for admin dashboard — aggregates live Prisma data
  // for the caller's tenant. Falls back to safe zeros for derived metrics
  // that have not been wired up yet.
  async getOverview(companyId: string, month?: number, year?: number) {
    if (!companyId) {
      return this.emptyOverview();
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const y = year ?? now.getFullYear();
    const m = month ? month - 1 : now.getMonth();
    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 0, 23, 59, 59);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

    // Headcount snapshots for the last 6 months (including current)
    const headcountPoints = Array.from({ length: 6 }, (_, i) => {
      const offset = 5 - i;
      const d = new Date(y, m - offset, 1);
      const endOfMonth = new Date(y, m - offset + 1, 0, 23, 59, 59);
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      return { endOfMonth, monthLabel };
    });

    const [
      totalEmployees,
      activeEmployees,
      newHiresMTD,
      exitsMTD,
      openPositions,
      openHRQueries,
      pendingLeave,
      todayAttendance,
      monthAttendance,
      weekAttendance,
      lastPayrollRun,
      headcountTrendRows,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { companyId } }),
      this.prisma.employee.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.employee.count({
        where: { companyId, startDate: { gte: monthStart, lte: monthEnd } },
      }),
      this.prisma.employee.count({
        where: { companyId, endDate: { gte: monthStart, lte: monthEnd } },
      }),
      this.prisma.position.count({ where: { companyId, isActive: true } }),
      this.prisma.hRQuery.count({
        where: { companyId, status: { in: ['OPEN', 'PENDING', 'IN_PROGRESS'] } },
      }),
      this.prisma.leaveRequest.count({
        where: { companyId, status: 'PENDING' },
      }),
      this.prisma.attendance.findMany({
        where: { companyId, date: today },
        select: { status: true, checkIn: true },
      }),
      this.prisma.attendance.findMany({
        where: { companyId, date: { gte: monthStart, lte: monthEnd } },
        select: { status: true },
      }),
      this.prisma.attendance.findMany({
        where: { companyId, date: { gte: weekStart, lte: today } },
        select: { date: true, status: true },
      }),
      this.prisma.payrollRun.findFirst({
        where: { companyId, status: { in: ['APPROVED', 'PAID', 'CLOSED'] } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        select: { totalPayrollCost: true, totalGrossSalary: true, totalAllowances: true },
      }),
      Promise.all(
        headcountPoints.map(({ endOfMonth, monthLabel }) =>
          this.prisma.employee
            .count({
              where: {
                companyId,
                OR: [
                  { startDate: null },
                  { startDate: { lte: endOfMonth } },
                ],
                AND: [
                  {
                    OR: [
                      { endDate: null },
                      { endDate: { gt: endOfMonth } },
                    ],
                  },
                ],
              },
            })
            .then((value) => ({ month: monthLabel, value })),
        ),
      ),
    ]);

    // ── Derived: today's attendance command ──
    const presentToday = todayAttendance.filter((a) => a.status === 'PRESENT').length;
    const lateToday = todayAttendance.filter((a) => a.status === 'LATE').length;
    const absentToday = todayAttendance.filter((a) => a.status === 'ABSENT').length;
    const onLeaveToday = todayAttendance.filter((a) => a.status === 'ON_LEAVE').length;
    const checkedInToday = presentToday + lateToday;

    // ── Derived: month-to-date attendance rate ──
    const presentMonth = monthAttendance.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE',
    ).length;
    const monthRecords = monthAttendance.length;
    const attendanceRate =
      monthRecords > 0
        ? Number(((presentMonth / monthRecords) * 100).toFixed(1))
        : 0;
    const absenteeismRate =
      monthRecords > 0
        ? Number(((absentToday / Math.max(1, activeEmployees)) * 100).toFixed(1))
        : 0;

    // ── Derived: last-7-days weekly trend ──
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const attendanceWeeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const offset = 6 - i;
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const dayRecords = weekAttendance.filter(
        (a) => new Date(a.date).toDateString() === d.toDateString(),
      );
      const presentCount = dayRecords.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE',
      ).length;
      const totalCount = dayRecords.length;
      const rate =
        totalCount > 0
          ? Number(((presentCount / totalCount) * 100).toFixed(1))
          : 0;
      return { day: dayNames[d.getDay()], rate, present: presentCount };
    });

    // ── Derived: payroll cost from last approved run ──
    const totalPayrollCost = lastPayrollRun
      ? Number(lastPayrollRun.totalPayrollCost ?? lastPayrollRun.totalGrossSalary ?? 0)
      : 0;

    return {
      kpiStrip: {
        totalEmployees,
        activeEmployees,
        newHiresMTD,
        exitsMTD,
        vacancies: Math.max(0, openPositions - activeEmployees),
        totalPayrollCost,
        totalWorkforceCost: 0,
        attendanceRate,
        absenteeismRate,
        leaveUtilisation: 0,
        overtimeCost: 0,
        kpiAchievement: 0,
        performanceReviewCompletion: 0,
        trainingCompletion: 0,
        openHRQueries,
        complianceScore: 0,
        expiringContracts: 0,
        employeesOnProbation: 0,
        employeeTurnoverRate: 0,
        workforceHealthScore: 0,
      },
      approvalQueue: [],
      approvalAnalytics: { avgTurnaround: {}, slaBreachRate: '0%', longestPending: null, delegations: [] },
      governanceFeed: [],
      onboardingPipeline: [],
      blockedPerStep: [],
      offboardingPipeline: [],
      movementPipeline: [],
      establishment: {
        approvedPositions: openPositions,
        filledPositions: activeEmployees,
        vacantPositions: Math.max(0, openPositions - activeEmployees),
        futurePositions: 0,
        newHiresThisMonth: newHiresMTD,
        separationsThisMonth: exitsMTD,
        noManagerAssigned: 0,
        pendingOrgChanges: 0,
      },
      attendanceCommand: {
        attendanceRate,
        byMethod: [],
        checkedIn: checkedInToday,
        checkedOut: 0,
        notYetIn: Math.max(0, activeEmployees - checkedInToday - absentToday - onLeaveToday),
        absent: absentToday,
        exceptions: [],
        devices: [],
      },
      shiftPayrollReadiness: {
        shiftsWithGaps: 0,
        noShiftAssigned: 0,
        pendingSwaps: 0,
        unplannedOT: 0,
        attendanceUnapproved: 0,
        correctionsPending: 0,
        exceptionsUnresolved: 0,
        payrollCutoff: '',
      },
      leaveIntelligence: {
        liability: {},
        onLeaveToday: [],
        pendingApprovals: pendingLeave,
        cancellationsPending: 0,
        amendmentsPending: 0,
        encashmentPipeline: [],
        blackoutPeriods: [],
        carryForward: {},
      },
      systemHealth: {
        integrations: [],
        api: { usageToday: 0, usageThisMonth: 0, avgLatency: '0ms' },
        audit: {},
        notifications: [],
        backup: {},
      },
      attendanceWeeklyTrend,
      headcountMonthlyTrend: headcountTrendRows,
      approvalTurnaroundChart: [],
      leaveDistribution: [],
      earlyArrivals: [],
      exceptionsTrend: [],
    };
  }

  private emptyOverview() {
    return {
      kpiStrip: {
        totalEmployees: 0,
        activeEmployees: 0,
        newHiresMTD: 0,
        exitsMTD: 0,
        vacancies: 0,
        totalPayrollCost: 0,
        totalWorkforceCost: 0,
        attendanceRate: 0,
        absenteeismRate: 0,
        leaveUtilisation: 0,
        overtimeCost: 0,
        kpiAchievement: 0,
        performanceReviewCompletion: 0,
        trainingCompletion: 0,
        openHRQueries: 0,
        complianceScore: 0,
        expiringContracts: 0,
        employeesOnProbation: 0,
        employeeTurnoverRate: 0,
        workforceHealthScore: 0,
      },
      approvalQueue: [],
      approvalAnalytics: { avgTurnaround: {}, slaBreachRate: '0%', longestPending: null, delegations: [] },
      governanceFeed: [],
      onboardingPipeline: [],
      blockedPerStep: [],
      offboardingPipeline: [],
      movementPipeline: [],
      establishment: {
        approvedPositions: 0,
        filledPositions: 0,
        vacantPositions: 0,
        futurePositions: 0,
        newHiresThisMonth: 0,
        separationsThisMonth: 0,
        noManagerAssigned: 0,
        pendingOrgChanges: 0,
      },
      attendanceCommand: {
        attendanceRate: 0,
        byMethod: [],
        checkedIn: 0,
        checkedOut: 0,
        notYetIn: 0,
        absent: 0,
        exceptions: [],
        devices: [],
      },
      shiftPayrollReadiness: {
        shiftsWithGaps: 0,
        noShiftAssigned: 0,
        pendingSwaps: 0,
        unplannedOT: 0,
        attendanceUnapproved: 0,
        correctionsPending: 0,
        exceptionsUnresolved: 0,
        payrollCutoff: '',
      },
      leaveIntelligence: {
        liability: {},
        onLeaveToday: [],
        pendingApprovals: 0,
        cancellationsPending: 0,
        amendmentsPending: 0,
        encashmentPipeline: [],
        blackoutPeriods: [],
        carryForward: {},
      },
      systemHealth: {
        integrations: [],
        api: { usageToday: 0, usageThisMonth: 0, avgLatency: '0ms' },
        audit: {},
        notifications: [],
        backup: {},
      },
      attendanceWeeklyTrend: [],
      headcountMonthlyTrend: [],
      approvalTurnaroundChart: [],
      leaveDistribution: [],
      earlyArrivals: [],
      exceptionsTrend: [],
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
