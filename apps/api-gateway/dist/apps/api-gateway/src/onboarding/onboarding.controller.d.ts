import { OnboardingService } from '../../../onboarding-service/src/onboarding/onboarding.service';
import { OnboardingTaskService } from '../../../onboarding-service/src/tasks/tasks.service';
export declare class OnboardingController {
    private readonly onbService;
    private readonly taskService;
    constructor(onbService: OnboardingService, taskService: OnboardingTaskService);
    create(body: any): Promise<{
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
    list(query: any): Promise<{
        onboardings: any;
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
    update(id: string, body: any): Promise<{
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
    advance(id: string, body: any): Promise<{
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
    createTask(body: any): Promise<{
        id: any;
        onboardingId: any;
        title: any;
        description: any;
        assignee: any;
        dueDate: any;
        status: any;
        completedAt: any;
    }>;
    listTasks(onboardingId: string): Promise<{
        tasks: any;
    }>;
    completeTask(id: string): Promise<{
        id: any;
        onboardingId: any;
        title: any;
        description: any;
        assignee: any;
        dueDate: any;
        status: any;
        completedAt: any;
    }>;
}
