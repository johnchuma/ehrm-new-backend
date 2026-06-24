import { IamAuthService } from '../../../iam-service/src/auth/auth.service';
import { CompanyService } from '../../../company-service/src/companies/companies.service';
export declare class AuthController {
    private readonly iamAuthService;
    private readonly companyService;
    constructor(iamAuthService: IamAuthService, companyService: CompanyService);
    loginWithEmail(body: {
        email: string;
        password: string;
        companyId?: string;
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
    loginWithPhone(body: {
        phone: string;
        password: string;
        companyId?: string;
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
    register(body: any): Promise<{
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
    validateToken(body: {
        token: string;
    }): Promise<{
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
    refreshToken(body: {
        refreshToken: string;
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
    forgotPassword(body: {
        email: string;
        companyId?: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    changePassword(body: {
        userId: string;
        oldPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    logout(body: {
        userId: string;
    }): Promise<{
        message: string;
    }>;
    registerWorkspace(body: any): Promise<{
        company: {
            id: any;
            name: any;
            slug: any;
            email: any;
            phone: any;
            address: any;
            country: any;
            currency: any;
            timezone: any;
            logo: any;
            subscriptionPlan: any;
            industry: any;
            size: any;
            website: any;
            taxId: any;
            registrationNumber: any;
            status: any;
            createdAt: any;
            updatedAt: any;
        };
        workspaceType: any;
        plan: any;
        billing: any;
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
    me(req: any): Promise<any>;
}
