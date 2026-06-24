export declare class ActionService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        caseId: any;
        type: any;
        description: any;
        effectiveDate: any;
        issuedBy: any;
        status: any;
        createdAt: any;
    }>;
    approve(id: string, status: string): Promise<{
        id: any;
        caseId: any;
        type: any;
        description: any;
        effectiveDate: any;
        issuedBy: any;
        status: any;
        createdAt: any;
    }>;
    list(caseId: string): Promise<{
        actions: any;
    }>;
    private toResponse;
}
