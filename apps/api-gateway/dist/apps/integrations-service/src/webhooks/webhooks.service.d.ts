export declare class WebhookService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        url: any;
        events: any;
        secret: any;
        status: any;
        createdAt: any;
    }>;
    list(companyId: string): Promise<{
        webhooks: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private toResponse;
}
