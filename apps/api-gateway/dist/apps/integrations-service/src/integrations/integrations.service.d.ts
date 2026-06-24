export declare class IntegrationService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        provider: any;
        config: any;
        status: any;
        enabled: any;
        lastSyncAt: any;
        createdAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        provider: any;
        config: any;
        status: any;
        enabled: any;
        lastSyncAt: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        provider: any;
        config: any;
        status: any;
        enabled: any;
        lastSyncAt: any;
        createdAt: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(companyId: string, type?: string): Promise<{
        integrations: any;
    }>;
    toggle(id: string, enabled: boolean): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        provider: any;
        config: any;
        status: any;
        enabled: any;
        lastSyncAt: any;
        createdAt: any;
    }>;
    private toResponse;
}
