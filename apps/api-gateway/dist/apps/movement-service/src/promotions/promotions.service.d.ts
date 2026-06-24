export declare class PromotionService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        fromTitle: any;
        toTitle: any;
        fromGrade: any;
        toGrade: any;
        newSalary: any;
        effectiveDate: any;
        reason: any;
        status: any;
        createdAt: any;
    }>;
    approve(id: string, status: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        fromTitle: any;
        toTitle: any;
        fromGrade: any;
        toGrade: any;
        newSalary: any;
        effectiveDate: any;
        reason: any;
        status: any;
        createdAt: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        promotions: any;
    }>;
    private toResponse;
}
