export declare class AttendanceService {
    private readonly prisma;
    constructor(prisma: any);
    checkIn(data: {
        employeeId: string;
        method?: string;
        lat?: number;
        lng?: number;
        deviceId?: string;
        companyId?: string;
    }): Promise<{
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
    checkOut(data: {
        employeeId: string;
        method?: string;
        lat?: number;
        lng?: number;
    }): Promise<{
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
    getRecord(id: string): Promise<{
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
    listRecords(companyId: string, filters?: any): Promise<{
        records: any;
        total: any;
    }>;
    getTodayAttendance(companyId: string): Promise<{
        records: any;
        total: any;
    }>;
    bulkMark(data: {
        companyId: string;
        branchId?: string;
        departmentId?: string;
        date: string;
        status: string;
        employeeIds: string[];
    }): Promise<{
        marked: number;
        message: string;
    }>;
    private toResponse;
}
