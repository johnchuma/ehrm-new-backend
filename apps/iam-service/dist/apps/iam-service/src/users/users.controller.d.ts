import { UserService } from './users.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(data: any): Promise<{
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
    getUser(data: {
        id: string;
        companyId: string;
    }): Promise<{
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
    updateUser(data: {
        id: string;
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        isActive?: boolean;
        roleIds?: string[];
    }): Promise<{
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
    deleteUser(data: {
        id: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    listUsers(data: {
        companyId: string;
        page?: number;
        pageSize?: number;
        search?: string;
    }): Promise<{
        users: any;
        total: any;
        page: number;
        pageSize: number;
    }>;
    assignRole(data: {
        userId: string;
        roleId: string;
    }): Promise<{
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
    removeRole(data: {
        userId: string;
        roleId: string;
    }): Promise<{
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
}
