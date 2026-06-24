import { LeaveRequestService } from '../../../leave-service/src/leave-requests/leave-requests.service';
import { LeaveTypeService } from '../../../leave-service/src/leave-types/leave-types.service';
import { LeaveBalanceService } from '../../../leave-service/src/leave-balances/leave-balances.service';
import { EncashmentService } from '../../../leave-service/src/encashment/encashment.service';
import { BlackoutService } from '../../../leave-service/src/blackouts/blackouts.service';
export declare class LeaveController {
    private readonly reqService;
    private readonly typeService;
    private readonly balService;
    private readonly encService;
    private readonly boService;
    constructor(reqService: LeaveRequestService, typeService: LeaveTypeService, balService: LeaveBalanceService, encService: EncashmentService, boService: BlackoutService);
    create(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: string;
        from: any;
        to: any;
        days: any;
        reason: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    list(query: any): Promise<{
        requests: any;
        total: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: string;
        from: any;
        to: any;
        days: any;
        reason: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    approve(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: string;
        from: any;
        to: any;
        days: any;
        reason: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    reject(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: string;
        from: any;
        to: any;
        days: any;
        reason: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    calendar(companyId: string, query: any): Promise<{
        requests: any;
        total: any;
    }>;
    createType(body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        entitlementDays: any;
        color: any;
        accrual: any;
        carryForward: any;
        eligibility: any;
        maxCarry: any;
        createdAt: any;
    }>;
    listTypes(query: any): Promise<{
        types: any;
    }>;
    getType(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        entitlementDays: any;
        color: any;
        accrual: any;
        carryForward: any;
        eligibility: any;
        maxCarry: any;
        createdAt: any;
    }>;
    updateType(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        entitlementDays: any;
        color: any;
        accrual: any;
        carryForward: any;
        eligibility: any;
        maxCarry: any;
        createdAt: any;
    }>;
    deleteType(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listBalances(employeeId: string): Promise<{
        balances: any;
    }>;
    accrue(body: any): Promise<{
        id: any;
        employeeId: any;
        leaveTypeId: any;
        leaveTypeName: any;
        opening: any;
        accrued: any;
        used: any;
        available: any;
        year: any;
    }>;
    createEnc(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        leaveTypeId: any;
        days: any;
        amount: any;
        status: any;
        submittedAt: any;
    }>;
    listEnc(query: any): Promise<{
        encashments: any;
    }>;
    createBO(body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        from: any;
        to: any;
        scope: any;
        status: any;
        description: any;
    }>;
    listBO(query: any): Promise<{
        blackouts: any;
    }>;
    getLiability(companyId: string): Promise<{
        items: {
            department: string;
            headcount: number;
            totalDays: any;
            liability: number;
            encashmentExposure: number;
        }[];
        totalLiability: number;
        totalEncashmentExposure: number;
    }>;
}
