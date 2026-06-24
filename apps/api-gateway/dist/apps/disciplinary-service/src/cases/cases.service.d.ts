export declare class CaseService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        incident: any;
        description: any;
        date: any;
        reportedBy: any;
        severity: any;
        status: any;
        createdAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        incident: any;
        description: any;
        date: any;
        reportedBy: any;
        severity: any;
        status: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        incident: any;
        description: any;
        date: any;
        reportedBy: any;
        severity: any;
        status: any;
        createdAt: any;
    }>;
    list(companyId: string, filters?: any): Promise<{
        cases: any;
    }>;
    private toResponse;
}
