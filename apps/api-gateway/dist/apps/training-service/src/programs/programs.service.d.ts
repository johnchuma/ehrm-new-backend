export declare class ProgramService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        category: any;
        trainer: any;
        startDate: any;
        endDate: any;
        location: any;
        maxParticipants: any;
        enrolled: any;
        status: any;
        createdAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        category: any;
        trainer: any;
        startDate: any;
        endDate: any;
        location: any;
        maxParticipants: any;
        enrolled: any;
        status: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        category: any;
        trainer: any;
        startDate: any;
        endDate: any;
        location: any;
        maxParticipants: any;
        enrolled: any;
        status: any;
        createdAt: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(companyId: string, filters?: any): Promise<{
        programs: any;
    }>;
    private toResponse;
}
