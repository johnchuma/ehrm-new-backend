import { TransferService } from '../../../movement-service/src/transfers/transfers.service';
import { PromotionService } from '../../../movement-service/src/promotions/promotions.service';
export declare class MovementController {
    private readonly trService;
    private readonly prService;
    constructor(trService: TransferService, prService: PromotionService);
    createTr(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        fromBranchId: any;
        fromDepartmentId: any;
        toBranchId: any;
        toDepartmentId: any;
        effectiveDate: any;
        reason: any;
        status: any;
        createdAt: any;
    }>;
    listTr(query: any): Promise<{
        transfers: any;
    }>;
    approveTr(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        fromBranchId: any;
        fromDepartmentId: any;
        toBranchId: any;
        toDepartmentId: any;
        effectiveDate: any;
        reason: any;
        status: any;
        createdAt: any;
    }>;
    createPr(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        fromTitle: any;
        toTitle: any;
        fromGrade: any;
        toGrade: any;
        newSalary: any;
        effectiveDate: any;
        reason: any;
        status: any;
        createdAt: any;
    }>;
    listPr(query: any): Promise<{
        promotions: any;
    }>;
    approvePr(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        fromTitle: any;
        toTitle: any;
        fromGrade: any;
        toGrade: any;
        newSalary: any;
        effectiveDate: any;
        reason: any;
        status: any;
        createdAt: any;
    }>;
}
