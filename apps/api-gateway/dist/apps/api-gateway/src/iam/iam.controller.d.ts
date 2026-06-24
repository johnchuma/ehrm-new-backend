import { UserService } from '../../../iam-service/src/users/users.service';
import { RoleService } from '../../../iam-service/src/roles/roles.service';
export declare class IamController {
    private readonly userService;
    private readonly roleService;
    constructor(userService: UserService, roleService: RoleService);
    createUser(body: any): Promise<{
        id: any;
        email: any;
        phone: any;
        firstName: any;
        lastName: any;
        fullName: any;
        companyId: any;
        employeeId: any;
        isActive: any;
        emailVerified: any;
        phoneVerified: any;
        roles: any;
        createdAt: any;
        updatedAt: any;
        lastLoginAt: any;
    }>;
    listUsers(query: any): Promise<{
        users: any;
        total: any;
        page: number;
        pageSize: number;
    }>;
    getUser(id: string): Promise<{
        id: any;
        email: any;
        phone: any;
        firstName: any;
        lastName: any;
        fullName: any;
        companyId: any;
        employeeId: any;
        isActive: any;
        emailVerified: any;
        phoneVerified: any;
        roles: any;
        createdAt: any;
        updatedAt: any;
        lastLoginAt: any;
    }>;
    updateUser(id: string, body: any): Promise<{
        id: any;
        email: any;
        phone: any;
        firstName: any;
        lastName: any;
        fullName: any;
        companyId: any;
        employeeId: any;
        isActive: any;
        emailVerified: any;
        phoneVerified: any;
        roles: any;
        createdAt: any;
        updatedAt: any;
        lastLoginAt: any;
    }>;
    deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    assignRole(userId: string, roleId: string): Promise<{
        id: any;
        email: any;
        phone: any;
        firstName: any;
        lastName: any;
        fullName: any;
        companyId: any;
        employeeId: any;
        isActive: any;
        emailVerified: any;
        phoneVerified: any;
        roles: any;
        createdAt: any;
        updatedAt: any;
        lastLoginAt: any;
    }>;
    removeRole(userId: string, roleId: string): Promise<{
        id: any;
        email: any;
        phone: any;
        firstName: any;
        lastName: any;
        fullName: any;
        companyId: any;
        employeeId: any;
        isActive: any;
        emailVerified: any;
        phoneVerified: any;
        roles: any;
        createdAt: any;
        updatedAt: any;
        lastLoginAt: any;
    }>;
    createRole(body: any): Promise<{
        id: any;
        name: any;
        description: any;
        companyId: any;
        isSystem: any;
        permissions: any;
        createdAt: any;
    }>;
    listRoles(query: any): Promise<{
        roles: any;
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
    updateRole(id: string, body: any): Promise<{
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
}
