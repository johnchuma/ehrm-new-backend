import { CaseService } from '../../../disciplinary-service/src/cases/cases.service';
import { ActionService } from '../../../disciplinary-service/src/actions/actions.service';
export declare class DisciplinaryController {
    private readonly caseService;
    private readonly actService;
    constructor(caseService: CaseService, actService: ActionService);
    createCase(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        incident: any;
        description: any;
        date: any;
        reportedBy: any;
        severity: any;
        status: any;
        createdAt: any;
    }>;
    listCases(query: any): Promise<{
        cases: any;
    }>;
    getCase(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        incident: any;
        description: any;
        date: any;
        reportedBy: any;
        severity: any;
        status: any;
        createdAt: any;
    }>;
    updateCase(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        incident: any;
        description: any;
        date: any;
        reportedBy: any;
        severity: any;
        status: any;
        createdAt: any;
    }>;
    createAction(body: any): Promise<{
        id: any;
        caseId: any;
        type: any;
        description: any;
        effectiveDate: any;
        issuedBy: any;
        status: any;
        createdAt: any;
    }>;
    approveAction(id: string, body: any): Promise<{
        id: any;
        caseId: any;
        type: any;
        description: any;
        effectiveDate: any;
        issuedBy: any;
        status: any;
        createdAt: any;
    }>;
    listActions(caseId: string): Promise<{
        actions: any;
    }>;
}
