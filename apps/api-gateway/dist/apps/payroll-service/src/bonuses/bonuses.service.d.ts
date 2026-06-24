export declare class BonusService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        amount: any;
        period: any;
        status: any;
        notes: any;
    }>;
    list(companyId: string, type?: string): Promise<{
        bonuses: any;
    }>;
    private toResponse;
}
