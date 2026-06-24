export declare class TaskService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        priority: any;
        dueDate: any;
        status: any;
        assigneeId: any;
        assigneeName: any;
        category: any;
        createdBy: any;
        createdAt: any;
        completedAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        priority: any;
        dueDate: any;
        status: any;
        assigneeId: any;
        assigneeName: any;
        category: any;
        createdBy: any;
        createdAt: any;
        completedAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        priority: any;
        dueDate: any;
        status: any;
        assigneeId: any;
        assigneeName: any;
        category: any;
        createdBy: any;
        createdAt: any;
        completedAt: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    assign(id: string, assigneeId: string): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        priority: any;
        dueDate: any;
        status: any;
        assigneeId: any;
        assigneeName: any;
        category: any;
        createdBy: any;
        createdAt: any;
        completedAt: any;
    }>;
    complete(id: string): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        priority: any;
        dueDate: any;
        status: any;
        assigneeId: any;
        assigneeName: any;
        category: any;
        createdBy: any;
        createdAt: any;
        completedAt: any;
    }>;
    list(companyId: string, filters?: any): Promise<{
        tasks: any;
    }>;
    private toResponse;
}
