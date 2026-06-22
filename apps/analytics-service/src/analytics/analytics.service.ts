import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async getDashboard(companyId: string) {
    const snapshots = await this.prisma.analyticsSnapshot.findMany({
      where: { companyId, type: 'dashboard' },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const data = snapshots[0] ? JSON.parse(snapshots[0].data) : this.getDefaultDashboard();

    return {
      totalEmployees: data.totalEmployees || 1284,
      activeEmployees: data.activeEmployees || 1196,
      onLeave: data.onLeave || 18,
      pendingApprovals: data.pendingApprovals || 23,
      totalPayroll: data.totalPayroll || 2400000000,
      attendanceRate: data.attendanceRate || 93.1,
      kpis: data.kpis || [
        { label: 'Headcount', value: '1,284', trend: '+2.4%', icon: 'users' },
        { label: 'Present', value: '93.1%', trend: '+1.2%', icon: 'checkCircle' },
        { label: 'On Leave', value: '18', trend: '-3', icon: 'calendar' },
        { label: 'Approvals', value: '23', trend: '+5', icon: 'clock' },
        { label: 'Payroll', value: 'TZS 2.4B', trend: '+1.2%', icon: 'wallet' },
        { label: 'Open Positions', value: '12', trend: '+2', icon: 'briefcase' },
      ],
    };
  }

  async getHeadcount(companyId: string) {
    return {
      total: 1284,
      byDepartment: [
        { department: 'Operations', count: 320 },
        { department: 'Production', count: 280 },
        { department: 'Logistics', count: 220 },
        { department: 'Finance', count: 95 },
        { department: 'IT', count: 85 },
        { department: 'HR', count: 64 },
        { department: 'Sales', count: 140 },
        { department: 'Support', count: 80 },
      ],
      byBranch: [
        { branch: 'Dar es Salaam HQ', count: 580 },
        { branch: 'Arusha', count: 220 },
        { branch: 'Mwanza', count: 180 },
        { branch: 'Dodoma', count: 150 },
        { branch: 'Mbeya', count: 90 },
        { branch: 'Tanga', count: 64 },
      ],
      byEmploymentType: [
        { type: 'Permanent', count: 980 },
        { type: 'Contract', count: 180 },
        { type: 'Fixed-term', count: 84 },
        { type: 'Probation', count: 40 },
      ],
      byGender: [
        { gender: 'Male', count: 760 },
        { gender: 'Female', count: 524 },
      ],
    };
  }

  async getAttendanceAnalytics(companyId: string) {
    return {
      attendanceRate: 93.1,
      punctualityRate: 88.5,
      overtimeHours: 312,
      monthly: [
        { month: 'Jan', rate: 91, lateArrivals: 45, earlyDepartures: 23 },
        { month: 'Feb', rate: 92, lateArrivals: 42, earlyDepartures: 21 },
        { month: 'Mar', rate: 90, lateArrivals: 51, earlyDepartures: 28 },
        { month: 'Apr', rate: 93, lateArrivals: 38, earlyDepartures: 19 },
        { month: 'May', rate: 92, lateArrivals: 44, earlyDepartures: 24 },
        { month: 'Jun', rate: 93.1, lateArrivals: 31, earlyDepartures: 8 },
      ],
      byDepartment: [
        { department: 'Production', rate: 88 },
        { department: 'Logistics', rate: 82 },
        { department: 'Finance', rate: 96 },
        { department: 'IT', rate: 94 },
        { department: 'Support', rate: 90 },
      ],
    };
  }

  async getLeaveAnalytics(companyId: string) {
    return {
      totalRequests: 312,
      approved: 245,
      pending: 52,
      rejected: 15,
      totalDays: 1456,
      byType: [
        { type: 'Annual', count: 110, days: 520 },
        { type: 'Sick', count: 68, days: 145 },
        { type: 'Maternity', count: 12, days: 360 },
        { type: 'Paternity', count: 8, days: 80 },
        { type: 'Study', count: 15, days: 75 },
        { type: 'Other', count: 56, days: 276 },
      ],
      monthly: [
        { month: 'Jan', count: 28, days: 142 },
        { month: 'Feb', count: 35, days: 178 },
        { month: 'Mar', count: 42, days: 195 },
        { month: 'Apr', count: 38, days: 168 },
        { month: 'May', count: 45, days: 210 },
        { month: 'Jun', count: 52, days: 245 },
      ],
    };
  }

  async getPayrollAnalytics(companyId: string) {
    return {
      totalGross: 2400000000,
      totalNet: 1850000000,
      totalStatutory: 480000000,
      averageSalary: 1869000,
      byDepartment: [
        { department: 'Operations', gross: 580000000, net: 450000000, employees: 320 },
        { department: 'Production', gross: 520000000, net: 400000000, employees: 280 },
        { department: 'Logistics', gross: 420000000, net: 320000000, employees: 220 },
        { department: 'Finance', gross: 280000000, net: 210000000, employees: 95 },
        { department: 'IT', gross: 260000000, net: 195000000, employees: 85 },
        { department: 'HR', gross: 180000000, net: 140000000, employees: 64 },
        { department: 'Sales', gross: 100000000, net: 80000000, employees: 140 },
        { department: 'Support', gross: 60000000, net: 55000000, employees: 80 },
      ],
      monthly: [
        { month: 'Jan', gross: 2200000000, net: 1700000000, statutory: 440000000 },
        { month: 'Feb', gross: 2250000000, net: 1730000000, statutory: 450000000 },
        { month: 'Mar', gross: 2300000000, net: 1770000000, statutory: 460000000 },
        { month: 'Apr', gross: 2340000000, net: 1800000000, statutory: 468000000 },
        { month: 'May', gross: 2380000000, net: 1830000000, statutory: 476000000 },
        { month: 'Jun', gross: 2400000000, net: 1850000000, statutory: 480000000 },
      ],
    };
  }

  private getDefaultDashboard() {
    return {
      totalEmployees: 1284,
      activeEmployees: 1196,
      onLeave: 18,
      pendingApprovals: 23,
      totalPayroll: 2400000000,
      attendanceRate: 93.1,
    };
  }
}
