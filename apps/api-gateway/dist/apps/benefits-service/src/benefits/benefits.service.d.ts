export declare class BenefitService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        description: any;
        employeeContribution: any;
        employerContribution: any;
        eligibility: any;
        status: any;
        createdAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        description: any;
        employeeContribution: any;
        employerContribution: any;
        eligibility: any;
        status: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        description: any;
        employeeContribution: any;
        employerContribution: any;
        eligibility: any;
        status: any;
        createdAt: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(companyId: string, type?: string): Promise<{
        benefits: any;
    }>;
    private toResponse;
}
