export declare class AdvanceService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        amount: any;
        termMonths: any;
        status: any;
        disbursedAt: any;
        notes: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        advances: any;
    }>;
    private toResponse;
}
