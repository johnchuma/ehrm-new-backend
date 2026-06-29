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

  // Company-wide overview for admin dashboard
  async getOverview(companyId: string, month?: number, year?: number) {
    // For now return a comprehensive overview payload mirroring the previous frontend mock.
    // This centralizes demo data on the backend so the frontend no longer imports mocks.
    const now = new Date();
    const kpiStrip = {
      totalEmployees: 1284,
      activeEmployees: 1256,
      newHiresMTD: 18,
      exitsMTD: 7,
      vacancies: 31,
      totalPayrollCost: 2847000000,
      totalWorkforceCost: 3416400000,
      attendanceRate: 93.1,
      absenteeismRate: 6.9,
      leaveUtilisation: 67,
      overtimeCost: 45800000,
      kpiAchievement: 78,
      performanceReviewCompletion: 82,
      trainingCompletion: 71,
      openHRQueries: 23,
      complianceScore: 94,
      expiringContracts: 12,
      employeesOnProbation: 8,
      employeeTurnoverRate: 4.2,
      workforceHealthScore: 86,
    };

    const approvalQueue = [
      { id: "WF-1041", employee: "Halima Kimaro", type: "Promotion", step: 2, totalSteps: 4, stepLabel: "HR Manager", initiator: "Line Manager", submitted: "3 days ago", sla: "On Track" },
      { id: "WF-1039", employee: "Said Mlay", type: "Leave Application", step: 1, totalSteps: 9, stepLabel: "Manager Review", initiator: "Employee", submitted: "Today", sla: "On Track" },
    ];

    const approvalAnalytics = {
      avgTurnaround: { "Leave Application": "1.4 days", "Promotion": "6.2 days" },
      slaBreachRate: "12%",
      longestPending: { id: "WF-1031", employee: "Grace Mutuku", type: "Onboarding Activation", days: 12 },
      delegations: [],
    };

    const governanceFeed = [];
    const onboardingPipeline = [];
    const blockedPerStep = [];
    const offboardingPipeline = [];
    const movementPipeline = [];
    const establishment = { approvedPositions: 1315, filledPositions: 1284, vacantPositions: 31, futurePositions: 12, newHiresThisMonth: 18, separationsThisMonth: 7, noManagerAssigned: 4, pendingOrgChanges: 3 };

    const attendanceCommand = {
      attendanceRate: 93.1,
      byMethod: [],
      checkedIn: 1196,
      checkedOut: 842,
      notYetIn: 48,
      absent: 40,
      exceptions: [],
      devices: [],
    };

    const shiftPayrollReadiness = { shiftsWithGaps: 2, noShiftAssigned: 14, pendingSwaps: 6, unplannedOT: 22, attendanceUnapproved: 38, correctionsPending: 14, exceptionsUnresolved: 19, payrollCutoff: "2026-06-30" };

    const leaveIntelligence = { liability: {}, onLeaveToday: [], pendingApprovals: 0, cancellationsPending: 0, amendmentsPending: 0, encashmentPipeline: [], blackoutPeriods: [], carryForward: {} };

    const systemHealth = { integrations: [], api: { usageToday: 0, usageThisMonth: 0, avgLatency: "0ms" }, audit: {}, notifications: [], backup: {} };

    const attendanceWeeklyTrend = [ { day: "Mon", rate: 94.2, present: 1210 }, { day: "Tue", rate: 92.8, present: 1192 }, { day: "Wed", rate: 95.1, present: 1221 }, { day: "Thu", rate: 91.5, present: 1175 }, { day: "Fri", rate: 89.3, present: 1147 }, { day: "Sat", rate: 78.6, present: 1009 }, { day: "Sun", rate: 0, present: 0 } ];

    const headcountMonthlyTrend = [ { month: "Jan", value: 1240 }, { month: "Feb", value: 1248 }, { month: "Mar", value: 1255 }, { month: "Apr", value: 1262 }, { month: "May", value: 1271 }, { month: "Jun", value: 1284 } ];

    const approvalTurnaroundChart = [];
    const leaveDistribution = [];
    const earlyArrivals = [];
    const exceptionsTrend = [];

    return {
      kpiStrip,
      approvalQueue,
      approvalAnalytics,
      governanceFeed,
      onboardingPipeline,
      blockedPerStep,
      offboardingPipeline,
      movementPipeline,
      establishment,
      attendanceCommand,
      shiftPayrollReadiness,
      leaveIntelligence,
      systemHealth,
      attendanceWeeklyTrend,
      headcountMonthlyTrend,
      approvalTurnaroundChart,
      leaveDistribution,
      earlyArrivals,
      exceptionsTrend,
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
