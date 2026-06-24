export declare class ClearanceService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        offboardingId: any;
        department: any;
        items: any;
        status: any;
        notes: any;
        createdAt: any;
    }>;
    approve(id: string, status: string, notes?: string): Promise<{
        id: any;
        offboardingId: any;
        department: any;
        items: any;
        status: any;
        notes: any;
        createdAt: any;
    }>;
    list(offboardingId: string): Promise<{
        clearances: any;
    }>;
    private toResponse;
}
