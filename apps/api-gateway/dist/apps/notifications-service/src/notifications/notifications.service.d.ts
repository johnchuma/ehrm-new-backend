export declare class NotificationService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        userId: any;
        companyId: any;
        title: any;
        message: any;
        type: any;
        link: any;
        category: any;
        isRead: any;
        createdAt: any;
        readAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        userId: any;
        companyId: any;
        title: any;
        message: any;
        type: any;
        link: any;
        category: any;
        isRead: any;
        createdAt: any;
        readAt: any;
    }>;
    markAsRead(id: string): Promise<{
        id: any;
        userId: any;
        companyId: any;
        title: any;
        message: any;
        type: any;
        link: any;
        category: any;
        isRead: any;
        createdAt: any;
        readAt: any;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(userId: string, unreadOnly?: boolean, page?: number, pageSize?: number): Promise<{
        notifications: any;
        total: any;
        unread: any;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: any;
    }>;
    private toResponse;
}
