export declare class ApprovalService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        employeeId: any;
        type: any;
        date: any;
        detail: any;
        reviewer: any;
        status: any;
        submittedAt: any;
    }>;
    decide(id: string, status: string): Promise<{
        id: any;
        employeeId: any;
        type: any;
        date: any;
        detail: any;
        reviewer: any;
        status: any;
        submittedAt: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        approvals: any;
    }>;
    private toResponse;
}
