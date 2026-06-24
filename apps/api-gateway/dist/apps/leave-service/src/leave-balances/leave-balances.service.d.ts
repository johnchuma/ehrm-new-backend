export declare class LeaveBalanceService {
    private readonly prisma;
    constructor(prisma: any);
    getBalance(employeeId: string, leaveTypeId: string): Promise<{
        id: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: any;
        opening: any;
        accrued: any;
        used: any;
        available: any;
        year: any;
    }>;
    listBalances(companyId: string, employeeId?: string): Promise<{
        balances: any;
    }>;
    accrue(data: {
        employeeId: string;
        leaveTypeId: string;
        days: number;
        year: string;
    }): Promise<{
        id: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: any;
        opening: any;
        accrued: any;
        used: any;
        available: any;
        year: any;
    }>;
    getLiability(companyId: string): Promise<{
        items: {
            department: string;
            headcount: number;
            totalDays: any;
            liability: number;
            encashmentExposure: number;
        }[];
        totalLiability: number;
        totalEncashmentExposure: number;
    }>;
    private toResponse;
}
