import { OffboardingService } from '../../../offboarding-service/src/offboarding/offboarding.service';
import { ClearanceService } from '../../../offboarding-service/src/clearance/clearance.service';
export declare class OffboardingController {
    private readonly offService;
    private readonly clrService;
    constructor(offService: OffboardingService, clrService: ClearanceService);
    create(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        reason: any;
        type: any;
        lastWorkingDay: any;
        noticeDate: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    list(query: any): Promise<{
        offboardings: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        reason: any;
        type: any;
        lastWorkingDay: any;
        noticeDate: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    update(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        reason: any;
        type: any;
        lastWorkingDay: any;
        noticeDate: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    advance(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        reason: any;
        type: any;
        lastWorkingDay: any;
        noticeDate: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    complete(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        reason: any;
        type: any;
        lastWorkingDay: any;
        noticeDate: any;
        status: any;
        createdAt: any;
        completedAt: any;
    }>;
    createClr(body: any): Promise<{
        id: any;
        offboardingId: any;
        department: any;
        items: any;
        status: any;
        notes: any;
        createdAt: any;
    }>;
    listClr(offboardingId: string): Promise<{
        clearances: any;
    }>;
    approveClr(id: string, body: any): Promise<{
        id: any;
        offboardingId: any;
        department: any;
        items: any;
        status: any;
        notes: any;
        createdAt: any;
    }>;
}
