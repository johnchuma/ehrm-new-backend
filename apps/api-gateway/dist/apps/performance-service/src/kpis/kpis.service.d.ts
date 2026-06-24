export declare class KpiService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
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
    get(id: string): Promise<{
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
    update(id: string, data: any): Promise<{
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
    list(companyId: string, category?: string): Promise<{
        kpis: any;
    }>;
    private toResponse;
}
