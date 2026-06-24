export declare class TicketService {
    private readonly prisma;
    constructor(prisma: any);
    list(companyId: string, userId?: string, status?: string): Promise<{
        tickets: any;
    }>;
    create(data: any): Promise<{
        id: any;
        companyId: any;
        userId: any;
        userName: any;
        subject: any;
        description: any;
        category: any;
        priority: any;
        status: any;
        replies: any;
        createdAt: any;
        closedAt: any;
    }>;
    reply(id: string, reply: string, userId: string): Promise<{
        id: any;
        companyId: any;
        userId: any;
        userName: any;
        subject: any;
        description: any;
        category: any;
        priority: any;
        status: any;
        replies: any;
        createdAt: any;
        closedAt: any;
    }>;
    private toResponse;
}
