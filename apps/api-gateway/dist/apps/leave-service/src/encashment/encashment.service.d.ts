export declare class EncashmentService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        days: any;
        amount: any;
        status: any;
        submittedAt: any;
    }>;
    approve(id: string, status: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        days: any;
        amount: any;
        status: any;
        submittedAt: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        encashments: any;
    }>;
    private toResponse;
}
