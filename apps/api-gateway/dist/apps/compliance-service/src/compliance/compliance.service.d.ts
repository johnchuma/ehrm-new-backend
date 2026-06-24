export declare class ComplianceService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        description: any;
        authority: any;
        frequency: any;
        dueDate: any;
        status: any;
        createdAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        description: any;
        authority: any;
        frequency: any;
        dueDate: any;
        status: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        description: any;
        authority: any;
        frequency: any;
        dueDate: any;
        status: any;
        createdAt: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        requirements: any;
    }>;
    private toResponse;
}
