export declare class AssetService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        category: any;
        serialNumber: any;
        model: any;
        purchaseDate: any;
        purchasePrice: any;
        status: any;
        condition: any;
        location: any;
        assignedTo: any;
        createdAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        category: any;
        serialNumber: any;
        model: any;
        purchaseDate: any;
        purchasePrice: any;
        status: any;
        condition: any;
        location: any;
        assignedTo: any;
        createdAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        category: any;
        serialNumber: any;
        model: any;
        purchaseDate: any;
        purchasePrice: any;
        status: any;
        condition: any;
        location: any;
        assignedTo: any;
        createdAt: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(companyId: string, filters?: any): Promise<{
        assets: any;
    }>;
    private toResponse;
}
