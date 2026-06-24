export declare class AIService {
    private readonly prisma;
    constructor(prisma: any);
    chat(data: {
        companyId: string;
        userId: string;
        message: string;
        context?: string;
    }): Promise<{
        response: string;
        suggestions: string[];
        confidence: string;
    }>;
    summarizeEmployee(employeeId: string): Promise<{
        summary: string;
        highlights: string[];
        concerns: string[];
        recommendations: string[];
    }>;
    getInsights(companyId: string, type: string): Promise<{
        type: string;
        insights: {
            title: string;
            description: string;
            severity: string;
            category: string;
        }[];
        summary: string;
    }>;
    predictAttrition(companyId: string, departmentId?: string): Promise<{
        riskScore: number;
        employees: {
            employeeId: string;
            employeeName: string;
            riskScore: number;
            department: string;
        }[];
        factors: string[];
    }>;
    recommendActions(companyId: string, type: string): Promise<{
        recommendations: {
            title: string;
            description: string;
            priority: string;
            category: string;
            impact: string;
        }[];
    }>;
    private generateResponse;
    private getSuggestions;
}
