export declare class LeaveTypeService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        entitlementDays: any;
        color: any;
        accrual: any;
        carryForward: any;
        eligibility: any;
        maxCarry: any;
        createdAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        entitlementDays: any;
        color: any;
        accrual: any;
        carryForward: any;
        eligibility: any;
        maxCarry: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        entitlementDays: any;
        color: any;
        accrual: any;
        carryForward: any;
        eligibility: any;
        maxCarry: any;
        createdAt: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(companyId: string): Promise<{
        types: any;
    }>;
    private toResponse;
}
