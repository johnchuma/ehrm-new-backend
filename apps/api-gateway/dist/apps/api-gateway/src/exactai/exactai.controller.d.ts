import { AIService } from '../../../exactai-service/src/ai/ai.service';
export declare class ExactAIController {
    private readonly aiService;
    constructor(aiService: AIService);
    chat(body: any): Promise<{
        response: string;
        suggestions: string[];
        confidence: string;
    }>;
    summarize(employeeId: string): Promise<{
        summary: string;
        highlights: string[];
        concerns: string[];
        recommendations: string[];
    }>;
    insights(query: any): Promise<{
        type: string;
        insights: {
            title: string;
            description: string;
            severity: string;
            category: string;
        }[];
        summary: string;
    }>;
    predict(query: any): Promise<{
        riskScore: number;
        employees: {
            employeeId: string;
            employeeName: string;
            riskScore: number;
            department: string;
        }[];
        factors: string[];
    }>;
    recommend(body: any): Promise<{
        recommendations: {
            title: string;
            description: string;
            priority: string;
            category: string;
            impact: string;
        }[];
    }>;
}
