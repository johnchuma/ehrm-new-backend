import { AuthService } from '../../../../libs/common/src/auth/auth.service';
export declare class IamAuthService {
    private readonly prisma;
    private readonly authService;
    constructor(prisma: any, authService: AuthService);
    loginWithEmail(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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
        };
    }>;
    loginWithPhone(phone: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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
        };
    }>;
    register(data: {
        email: string;
        phone: string;
        password: string;
        firstName: string;
        lastName: string;
        companyId: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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
        };
    }>;
    validateToken(token: string): Promise<{
        valid: boolean;
        user: {
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
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateAuthResponse;
    private toUserResponse;
}
