export declare class StatutoryService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        type: any;
        period: any;
        amount: any;
        dueDate: any;
        authority: any;
        status: any;
        reference: any;
        filedDate: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        type: any;
        period: any;
        amount: any;
        dueDate: any;
        authority: any;
        status: any;
        reference: any;
        filedDate: any;
        createdAt: any;
    }>;
    list(companyId: string, filters?: any): Promise<{
        filings: any;
    }>;
    private toResponse;
}
