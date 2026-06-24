import { ReviewService } from '../../../performance-service/src/reviews/reviews.service';
import { GoalService } from '../../../performance-service/src/goals/goals.service';
import { KpiService } from '../../../performance-service/src/kpis/kpis.service';
export declare class PerformanceController {
    private readonly revService;
    private readonly goalService;
    private readonly kpiService;
    constructor(revService: ReviewService, goalService: GoalService, kpiService: KpiService);
    createRev(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        reviewerId: any;
        reviewerName: any;
        period: any;
        type: any;
        rating: any;
        strengths: any;
        improvements: any;
        comments: any;
        status: any;
        createdAt: any;
        submittedAt: any;
    }>;
    listRev(query: any): Promise<{
        reviews: any;
    }>;
    getRev(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        reviewerId: any;
        reviewerName: any;
        period: any;
        type: any;
        rating: any;
        strengths: any;
        improvements: any;
        comments: any;
        status: any;
        createdAt: any;
        submittedAt: any;
    }>;
    updateRev(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        reviewerId: any;
        reviewerName: any;
        period: any;
        type: any;
        rating: any;
        strengths: any;
        improvements: any;
        comments: any;
        status: any;
        createdAt: any;
        submittedAt: any;
    }>;
    submitRev(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        reviewerId: any;
        reviewerName: any;
        period: any;
        type: any;
        rating: any;
        strengths: any;
        improvements: any;
        comments: any;
        status: any;
        createdAt: any;
        submittedAt: any;
    }>;
    createGoal(body: any): Promise<{
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
    listGoals(query: any): Promise<{
        goals: any;
    }>;
    getGoal(id: string): Promise<{
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
    updateGoal(id: string, body: any): Promise<{
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
    deleteGoal(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createKpi(body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        description: any;
        unit: any;
        target: any;
        actual: any;
        achievement: number;
        category: any;
        createdAt: any;
    }>;
    listKpis(query: any): Promise<{
        kpis: any;
    }>;
    updateKpi(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        description: any;
        unit: any;
        target: any;
        actual: any;
        achievement: number;
        category: any;
        createdAt: any;
    }>;
}
