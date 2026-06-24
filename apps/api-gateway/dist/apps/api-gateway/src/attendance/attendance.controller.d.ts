import { AttendanceService } from '../../../attendance-service/src/attendance/attendance.service';
import { ExceptionService } from '../../../attendance-service/src/exceptions/exceptions.service';
import { ShiftService } from '../../../attendance-service/src/shifts/shifts.service';
import { SwapService } from '../../../attendance-service/src/swap-requests/swap.service';
import { OvertimeService } from '../../../attendance-service/src/overtime/overtime.service';
import { GeofenceService } from '../../../attendance-service/src/geofencing/geofencing.service';
import { ApprovalService } from '../../../attendance-service/src/attendance/approvals.service';
export declare class AttendanceController {
    private readonly attService;
    private readonly excService;
    private readonly shiftService;
    private readonly swapService;
    private readonly otService;
    private readonly gfService;
    private readonly apprService;
    constructor(attService: AttendanceService, excService: ExceptionService, shiftService: ShiftService, swapService: SwapService, otService: OvertimeService, gfService: GeofenceService, apprService: ApprovalService);
    checkIn(body: any): Promise<{
        id: any;
        employeeId: any;
        companyId: any;
        date: any;
        checkIn: any;
        checkOut: any;
        hours: any;
        method: any;
        status: any;
        lat: any;
        lng: any;
    }>;
    checkOut(body: any): Promise<{
        id: any;
        employeeId: any;
        companyId: any;
        date: any;
        checkIn: any;
        checkOut: any;
        hours: any;
        method: any;
        status: any;
        lat: any;
        lng: any;
    }>;
    listRecords(query: any): Promise<{
        records: any;
        total: any;
    }>;
    today(companyId: string): Promise<{
        records: any;
        total: any;
    }>;
    bulkMark(body: any): Promise<{
        marked: number;
        message: string;
    }>;
    createException(body: any): Promise<{
        id: any;
        employeeId: any;
        type: any;
        date: any;
        details: any;
        severity: any;
        flagged: any;
        status: any;
        createdAt: any;
    }>;
    listExceptions(query: any): Promise<{
        exceptions: any;
    }>;
    resolveException(id: string, body: any): Promise<{
        id: any;
        employeeId: any;
        type: any;
        date: any;
        details: any;
        severity: any;
        flagged: any;
        status: any;
        createdAt: any;
    }>;
    createShift(body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        startTime: any;
        endTime: any;
        type: any;
        graceMinutes: any;
        color: any;
    }>;
    listShifts(query: any): Promise<{
        shifts: any;
    }>;
    assignShift(body: any): Promise<{
        id: any;
        employeeId: any;
        shiftId: any;
        status: any;
        effectiveFrom: any;
    }>;
    createOT(body: any): Promise<{
        id: any;
        employeeId: any;
        date: any;
        hours: any;
        rate: any;
        reason: any;
        status: any;
        submittedAt: any;
    }>;
    listOT(query: any): Promise<{
        overtime: any;
    }>;
    approveOT(id: string, body: any): Promise<{
        id: any;
        employeeId: any;
        date: any;
        hours: any;
        rate: any;
        reason: any;
        status: any;
        submittedAt: any;
    }>;
    createGF(body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        lat: any;
        lng: any;
        radius: any;
        branchIds: any;
        status: any;
    }>;
    listGF(query: any): Promise<{
        geofences: any;
    }>;
    createAppr(body: any): Promise<{
        id: any;
        employeeId: any;
        type: any;
        date: any;
        detail: any;
        reviewer: any;
        status: any;
        submittedAt: any;
    }>;
    listAppr(query: any): Promise<{
        approvals: any;
    }>;
}
