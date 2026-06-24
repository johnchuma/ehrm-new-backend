export declare class LeaveRequestService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: string;
        from: any;
        to: any;
        days: any;
        reason: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    approve(id: string, approverId: string, comments?: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: string;
        from: any;
        to: any;
        days: any;
        reason: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    reject(id: string, approverId: string, reason: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: string;
        from: any;
        to: any;
        days: any;
        reason: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: string;
        from: any;
        to: any;
        days: any;
        reason: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    list(companyId: string, filters?: any): Promise<{
        requests: any;
        total: any;
    }>;
    getCalendarEvents(companyId: string, year: number, month: number): Promise<{
        requests: any;
        total: any;
    }>;
    private calculateDays;
    private toResponse;
}
