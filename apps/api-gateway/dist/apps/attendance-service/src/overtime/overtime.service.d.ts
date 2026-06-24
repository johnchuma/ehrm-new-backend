export declare class OvertimeService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        employeeId: any;
        date: any;
        hours: any;
        rate: any;
        reason: any;
        status: any;
        submittedAt: any;
    }>;
    approve(id: string, status: string): Promise<{
        id: any;
        employeeId: any;
        date: any;
        hours: any;
        rate: any;
        reason: any;
        status: any;
        submittedAt: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        overtime: any;
    }>;
    private toResponse;
}
