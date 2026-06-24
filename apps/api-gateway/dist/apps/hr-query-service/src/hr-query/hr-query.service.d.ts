export declare class HRQueryService {
    private readonly prisma;
    constructor(prisma: any);
    askQuestion(data: {
        companyId: string;
        userId: string;
        question: string;
        category?: string;
    }): Promise<{
        answer: any;
        confidence: string;
        relatedQuestions: any;
        relatedFAQs: any;
    }>;
    getFAQs(companyId: string, category?: string): Promise<{
        faqs: any;
    }>;
    createFAQ(data: any): Promise<{
        id: any;
        question: any;
        answer: any;
        category: any;
        views: any;
        helpfulness: any;
        createdAt: any;
    }>;
    private toFaqResponse;
}
