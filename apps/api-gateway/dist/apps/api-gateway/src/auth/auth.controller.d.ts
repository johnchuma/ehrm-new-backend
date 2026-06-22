import { ClientGrpc } from '@nestjs/microservices';
export declare class AuthController {
    private readonly client;
    private readonly companyClient;
    private iamService;
    private companyService;
    constructor(client: ClientGrpc, companyClient: ClientGrpc);
    onModuleInit(): void;
    loginWithEmail(body: {
        email: string;
        password: string;
        companyId?: string;
    }): Promise<unknown>;
    loginWithPhone(body: {
        phone: string;
        password: string;
        companyId?: string;
    }): Promise<unknown>;
    register(body: any): Promise<unknown>;
    validateToken(body: {
        token: string;
    }): Promise<unknown>;
    refreshToken(body: {
        refreshToken: string;
    }): Promise<unknown>;
    forgotPassword(body: {
        email: string;
        companyId?: string;
    }): Promise<unknown>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<unknown>;
    changePassword(body: {
        userId: string;
        oldPassword: string;
        newPassword: string;
    }): Promise<unknown>;
    logout(body: {
        userId: string;
    }): Promise<unknown>;
    registerWorkspace(body: {
        workspaceType: string;
        company: string;
        employees?: number;
        sector?: string;
        size?: string;
        country?: string;
        currency?: string;
        additionalCompanies?: Array<{
            company: string;
            sector?: string;
            size?: string;
            country?: string;
            currency?: string;
        }>;
        fname: string;
        lname: string;
        email: string;
        phone?: string;
        password: string;
        plan: string;
        billing?: string;
    }): Promise<any>;
    me(req: any): Promise<any>;
}
