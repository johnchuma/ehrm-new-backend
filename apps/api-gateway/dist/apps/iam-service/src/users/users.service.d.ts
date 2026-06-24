import { AuthService } from '../../../../libs/common/src/auth/auth.service';
export declare class UserService {
    private readonly prisma;
    private readonly authService;
    constructor(prisma: any, authService: AuthService);
    createUser(data: {
        email: string;
        phone: string;
        password: string;
        firstName: string;
        lastName: string;
        companyId: string;
        employeeId?: string;
        roleIds?: string[];
        isActive?: boolean;
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
    updateUser(id: string, data: {
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
    deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listUsers(companyId: string, page?: number, pageSize?: number, search?: string): Promise<{
        users: any;
        total: any;
        page: number;
        pageSize: number;
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
    private toUserResponse;
}
