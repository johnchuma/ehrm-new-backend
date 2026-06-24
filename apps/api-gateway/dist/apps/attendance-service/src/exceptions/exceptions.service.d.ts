export declare class ExceptionService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        employeeId: any;
        type: any;
        date: any;
        details: any;
        severity: any;
        flagged: any;
        status: any;
        createdAt: any;
    }>;
    resolve(id: string, notes?: string): Promise<{
        id: any;
        employeeId: any;
        type: any;
        date: any;
        details: any;
        severity: any;
        flagged: any;
        status: any;
        createdAt: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        exceptions: any;
    }>;
    private toResponse;
}
