import { RoleService } from './roles.service';
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    createRole(data: any): Promise<{
        id: any;
        name: any;
        description: any;
        companyId: any;
        isSystem: any;
        permissions: any;
        createdAt: any;
    }>;
    getRole(data: {
        id: string;
    }): Promise<{
        id: any;
        name: any;
        description: any;
        companyId: any;
        isSystem: any;
        permissions: any;
        createdAt: any;
    }>;
    updateRole(data: {
        id: string;
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
    deleteRole(data: {
        id: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    listRoles(data: {
        companyId: string;
    }): Promise<{
        roles: any;
    }>;
    assignPermission(data: {
        roleId: string;
        permissionId: string;
    }): Promise<{
        id: any;
        name: any;
        description: any;
        companyId: any;
        isSystem: any;
        permissions: any;
        createdAt: any;
    }>;
}
