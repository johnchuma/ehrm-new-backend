export declare class DocumentService {
    private readonly prisma;
    constructor(prisma: any);
    uploadDocument(data: any): Promise<{
        id: any;
        employeeId: any;
        category: any;
        fileName: any;
        fileUrl: any;
        version: any;
        uploadedAt: any;
    }>;
    getDocument(id: string): Promise<any>;
    deleteDocument(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listDocuments(employeeId: string): Promise<{
        documents: any;
    }>;
    private toDocResponse;
}
