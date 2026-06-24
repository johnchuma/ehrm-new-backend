export declare class BlackoutService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        from: any;
        to: any;
        scope: any;
        status: any;
        description: any;
    }>;
    list(companyId: string): Promise<{
        blackouts: any;
    }>;
    private toResponse;
}
