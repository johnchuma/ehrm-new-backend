import { ComplianceService } from '../../../compliance-service/src/compliance/compliance.service';
import { StatutoryService } from '../../../compliance-service/src/statutory/statutory.service';
export declare class ComplianceController {
    private readonly compService;
    private readonly statService;
    constructor(compService: ComplianceService, statService: StatutoryService);
    createReq(body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        description: any;
        authority: any;
        frequency: any;
        dueDate: any;
        status: any;
        createdAt: any;
    }>;
    listReq(query: any): Promise<{
        requirements: any;
    }>;
    updateReq(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        description: any;
        authority: any;
        frequency: any;
        dueDate: any;
        status: any;
        createdAt: any;
    }>;
    createFiling(body: any): Promise<{
        id: any;
        companyId: any;
        type: any;
        period: any;
        amount: any;
        dueDate: any;
        authority: any;
        status: any;
        reference: any;
        filedDate: any;
        createdAt: any;
    }>;
    listFilings(query: any): Promise<{
        filings: any;
    }>;
    updateFiling(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        type: any;
        period: any;
        amount: any;
        dueDate: any;
        authority: any;
        status: any;
        reference: any;
        filedDate: any;
        createdAt: any;
    }>;
}
