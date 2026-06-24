export declare class GoalService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        title: any;
        description: any;
        category: any;
        targetDate: any;
        weight: any;
        progress: any;
        status: any;
        createdAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        title: any;
        description: any;
        category: any;
        targetDate: any;
        weight: any;
        progress: any;
        status: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        title: any;
        description: any;
        category: any;
        targetDate: any;
        weight: any;
        progress: any;
        status: any;
        createdAt: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(companyId: string, filters?: any): Promise<{
        goals: any;
    }>;
    private toResponse;
}
