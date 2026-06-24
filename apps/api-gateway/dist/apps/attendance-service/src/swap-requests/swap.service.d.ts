export declare class SwapService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        requesterId: any;
        requesteeId: any;
        date: any;
        fromShift: any;
        toShift: any;
        reason: any;
        status: any;
    }>;
    approve(id: string, status: string): Promise<{
        id: any;
        requesterId: any;
        requesteeId: any;
        date: any;
        fromShift: any;
        toShift: any;
        reason: any;
        status: any;
    }>;
    list(companyId: string, status?: string): Promise<{
        swaps: any;
    }>;
    private toResponse;
}
