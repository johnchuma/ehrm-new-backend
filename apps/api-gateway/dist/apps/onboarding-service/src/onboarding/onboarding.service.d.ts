export declare class OnboardingService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        startDate: any;
        buddy: any;
        departmentId: any;
        position: any;
        currentStage: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        startDate: any;
        buddy: any;
        departmentId: any;
        position: any;
        currentStage: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        startDate: any;
        buddy: any;
        departmentId: any;
        position: any;
        currentStage: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    advanceStage(id: string, stage: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        startDate: any;
        buddy: any;
        departmentId: any;
        position: any;
        currentStage: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    complete(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        startDate: any;
        buddy: any;
        departmentId: any;
        position: any;
        currentStage: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        onboardings: any;
    }>;
    private toResponse;
}
