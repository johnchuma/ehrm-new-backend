import { NotificationService } from '../../../notifications-service/src/notifications/notifications.service';
export declare class NotificationsController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    create(body: any): Promise<{
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
    list(query: any): Promise<{
        notifications: any;
        total: any;
        unread: any;
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
    markRead(id: string): Promise<{
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
    markAll(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unread(userId: string): Promise<{
        count: any;
    }>;
}
