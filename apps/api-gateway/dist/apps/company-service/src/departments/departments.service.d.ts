export declare class DepartmentService {
    private readonly prisma;
    constructor(prisma: any);
    createDepartment(data: any): Promise<{
        id: any;
        companyId: any;
        branchId: any;
        name: any;
        code: any;
        description: any;
        headId: any;
        parentId: any;
        isActive: any;
        createdAt: any;
    }>;
    getDepartment(id: string): Promise<{
        id: any;
        companyId: any;
        branchId: any;
        name: any;
        code: any;
        description: any;
        headId: any;
        parentId: any;
        isActive: any;
        createdAt: any;
    }>;
    updateDepartment(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        branchId: any;
        name: any;
        code: any;
        description: any;
        headId: any;
        parentId: any;
        isActive: any;
        createdAt: any;
    }>;
    deleteDepartment(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listDepartments(companyId: string, branchId?: string): Promise<{
        departments: any;
    }>;
    private toDeptResponse;
}
