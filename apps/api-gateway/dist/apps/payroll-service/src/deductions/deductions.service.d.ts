export declare class DeductionService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        code: any;
        amount: any;
        month: any;
        year: any;
        notes: any;
    }>;
    list(companyId: string): Promise<{
        deductions: any;
    }>;
    private toResponse;
}
