export declare class BranchService {
    private readonly prisma;
    constructor(prisma: any);
    createBranch(data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        code: any;
        address: any;
        city: any;
        country: any;
        phone: any;
        email: any;
        managerId: any;
        isActive: any;
        createdAt: any;
    }>;
    getBranch(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        code: any;
        address: any;
        city: any;
        country: any;
        phone: any;
        email: any;
        managerId: any;
        isActive: any;
        createdAt: any;
    }>;
    updateBranch(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        code: any;
        address: any;
        city: any;
        country: any;
        phone: any;
        email: any;
        managerId: any;
        isActive: any;
        createdAt: any;
    }>;
    deleteBranch(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listBranches(companyId: string): Promise<{
        branches: any;
    }>;
    private toBranchResponse;
}
