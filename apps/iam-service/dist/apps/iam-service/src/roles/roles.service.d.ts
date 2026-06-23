export declare class RoleService {
    private readonly prisma;
    constructor(prisma: any);
    createRole(data: {
        name: string;
        description: string;
        companyId: string;
        permissionIds?: string[];
    }): Promise<{
        id: any;
        name: any;
        description: any;
        companyId: any;
        isSystem: any;
        permissions: any;
        createdAt: any;
    }>;
    getRole(id: string): Promise<{
        id: any;
        name: any;
        description: any;
        companyId: any;
        isSystem: any;
        permissions: any;
        createdAt: any;
    }>;
    updateRole(id: string, data: {
        name?: string;
        description?: string;
        permissionIds?: string[];
    }): Promise<{
        id: any;
        name: any;
        description: any;
        companyId: any;
        isSystem: any;
        permissions: any;
        createdAt: any;
    }>;
    deleteRole(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listRoles(companyId: string): Promise<{
        roles: any;
    }>;
    assignPermission(roleId: string, permissionId: string): Promise<{
        id: any;
        name: any;
        description: any;
        companyId: any;
        isSystem: any;
        permissions: any;
        createdAt: any;
    }>;
    private toRoleResponse;
}
