export declare class AssignmentService {
    private readonly prisma;
    constructor(prisma: any);
    assign(data: any): Promise<{
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
    returnAsset(id: string, returnDate: string, condition: string, notes?: string): Promise<{
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
    list(companyId?: string, employeeId?: string): Promise<{
        assignments: any;
    }>;
    private toResponse;
}
