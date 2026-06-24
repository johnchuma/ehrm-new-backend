export declare class ReviewService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
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
    get(id: string): Promise<{
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
    update(id: string, data: any): Promise<{
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
    submit(id: string): Promise<{
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
    list(companyId: string, filters?: any): Promise<{
        reviews: any;
    }>;
    private toResponse;
}
