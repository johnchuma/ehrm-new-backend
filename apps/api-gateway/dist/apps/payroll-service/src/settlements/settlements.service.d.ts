export declare class SettlementService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        amount: any;
        reason: any;
        effectiveDate: any;
        status: any;
        createdAt: any;
    }>;
    approve(id: string, status: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        amount: any;
        reason: any;
        effectiveDate: any;
        status: any;
        createdAt: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        settlements: any;
    }>;
    private toResponse;
}
