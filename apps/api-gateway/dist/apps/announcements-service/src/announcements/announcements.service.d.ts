export declare class AnnouncementService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        title: any;
        content: any;
        type: any;
        priority: any;
        audience: any;
        publishedAt: any;
        expiresAt: any;
        authorId: any;
        createdAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        title: any;
        content: any;
        type: any;
        priority: any;
        audience: any;
        publishedAt: any;
        expiresAt: any;
        authorId: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        title: any;
        content: any;
        type: any;
        priority: any;
        audience: any;
        publishedAt: any;
        expiresAt: any;
        authorId: any;
        createdAt: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(companyId: string, filters?: any): Promise<{
        announcements: any;
    }>;
    private toResponse;
}
