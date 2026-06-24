export declare class DocumentService {
    private readonly prisma;
    constructor(prisma: any);
    upload(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        name: any;
        type: any;
        category: any;
        url: any;
        size: any;
        uploadedBy: any;
        description: any;
        sharedWith: any;
        expiresAt: any;
        createdAt: any;
        updatedAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        name: any;
        type: any;
        category: any;
        url: any;
        size: any;
        uploadedBy: any;
        description: any;
        sharedWith: any;
        expiresAt: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        name: any;
        type: any;
        category: any;
        url: any;
        size: any;
        uploadedBy: any;
        description: any;
        sharedWith: any;
        expiresAt: any;
        createdAt: any;
        updatedAt: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(companyId: string, filters?: any): Promise<{
        documents: any;
    }>;
    share(id: string, userIds: string[], expiresAt?: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        name: any;
        type: any;
        category: any;
        url: any;
        size: any;
        uploadedBy: any;
        description: any;
        sharedWith: any;
        expiresAt: any;
        createdAt: any;
        updatedAt: any;
    }>;
    private toResponse;
}
