import { AnalyticsService } from '../../../analytics-service/src/analytics/analytics.service';
export declare class AnalyticsController {
    private readonly service;
    constructor(service: AnalyticsService);
    dashboard(companyId: string): Promise<{
        totalEmployees: any;
        activeEmployees: any;
        onLeave: any;
        pendingApprovals: any;
        totalPayroll: any;
        attendanceRate: any;
        kpis: any;
    }>;
    headcount(companyId: string): Promise<{
        total: number;
        byDepartment: {
            department: string;
            count: number;
        }[];
        byBranch: {
            branch: string;
            count: number;
        }[];
        byEmploymentType: {
            type: string;
            count: number;
        }[];
        byGender: {
            gender: string;
            count: number;
        }[];
    }>;
    attendance(companyId: string): Promise<{
        attendanceRate: number;
        punctualityRate: number;
        overtimeHours: number;
        monthly: {
            month: string;
            rate: number;
            lateArrivals: number;
            earlyDepartures: number;
        }[];
        byDepartment: {
            department: string;
            rate: number;
        }[];
    }>;
    leave(companyId: string): Promise<{
        totalRequests: number;
        approved: number;
        pending: number;
        rejected: number;
        totalDays: number;
        byType: {
            type: string;
            count: number;
            days: number;
        }[];
        monthly: {
            month: string;
            count: number;
            days: number;
        }[];
    }>;
    payroll(companyId: string): Promise<{
        totalGross: number;
        totalNet: number;
        totalStatutory: number;
        averageSalary: number;
        byDepartment: {
            department: string;
            gross: number;
            net: number;
            employees: number;
        }[];
        monthly: {
            month: string;
            gross: number;
            net: number;
            statutory: number;
        }[];
    }>;
}
