import { AssetService } from '../../../assets-service/src/assets/assets.service';
import { AssignmentService } from '../../../assets-service/src/assignments/assignments.service';
export declare class AssetsController {
    private readonly assetService;
    private readonly assignService;
    constructor(assetService: AssetService, assignService: AssignmentService);
    create(body: any): Promise<{
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
    list(query: any): Promise<{
        assets: any;
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
    update(id: string, body: any): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    assign(body: any): Promise<{
        id: any;
        assetId: any;
        assetName: any;
        employeeId: any;
        employeeName: any;
        assignedDate: any;
        returnDate: any;
        status: any;
        condition: any;
        notes: any;
    }>;
    return(id: string, body: any): Promise<{
        id: any;
        assetId: any;
        assetName: any;
        employeeId: any;
        employeeName: any;
        assignedDate: any;
        returnDate: any;
        status: any;
        condition: any;
        notes: any;
    }>;
    listAssign(query: any): Promise<{
        assignments: any;
    }>;
}
