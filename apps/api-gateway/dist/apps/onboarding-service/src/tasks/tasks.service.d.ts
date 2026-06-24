export declare class OnboardingTaskService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        onboardingId: any;
        title: any;
        description: any;
        assignee: any;
        dueDate: any;
        status: any;
        completedAt: any;
    }>;
    complete(id: string): Promise<{
        id: any;
        onboardingId: any;
        title: any;
        description: any;
        assignee: any;
        dueDate: any;
        status: any;
        completedAt: any;
    }>;
    list(onboardingId: string): Promise<{
        tasks: any;
    }>;
    private toResponse;
}
