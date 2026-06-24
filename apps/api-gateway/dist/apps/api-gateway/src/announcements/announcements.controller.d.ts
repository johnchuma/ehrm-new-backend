import { AnnouncementService } from '../../../announcements-service/src/announcements/announcements.service';
export declare class AnnouncementsController {
    private readonly service;
    constructor(service: AnnouncementService);
    create(body: any): Promise<{
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
    list(query: any): Promise<{
        announcements: any;
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
    update(id: string, body: any): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
