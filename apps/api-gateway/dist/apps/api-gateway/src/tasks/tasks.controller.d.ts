import { TaskService } from '../../../tasks-service/src/tasks/tasks.service';
export declare class TasksController {
    private readonly taskService;
    constructor(taskService: TaskService);
    create(body: any): Promise<{
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
    list(query: any): Promise<{
        tasks: any;
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
    update(id: string, body: any): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    assign(id: string, body: any): Promise<{
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
}
