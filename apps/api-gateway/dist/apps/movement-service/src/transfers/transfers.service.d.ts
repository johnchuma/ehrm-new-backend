export declare class TransferService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        fromBranchId: any;
        fromDepartmentId: any;
        toBranchId: any;
        toDepartmentId: any;
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
        fromBranchId: any;
        fromDepartmentId: any;
        toBranchId: any;
        toDepartmentId: any;
        effectiveDate: any;
        reason: any;
        status: any;
        createdAt: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        transfers: any;
    }>;
    private toResponse;
}
