import { DocumentService } from '../../../documents-service/src/documents/documents.service';
export declare class DocumentsController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    upload(body: any): Promise<{
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
    list(query: any): Promise<{
        documents: any;
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
    update(id: string, body: any): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    share(id: string, body: any): Promise<{
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
}
