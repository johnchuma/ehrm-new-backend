export declare class ShiftService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        startTime: any;
        endTime: any;
        type: any;
        graceMinutes: any;
        color: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        startTime: any;
        endTime: any;
        type: any;
        graceMinutes: any;
        color: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        startTime: any;
        endTime: any;
        type: any;
        graceMinutes: any;
        color: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    list(companyId: string): Promise<{
        shifts: any;
    }>;
    assign(data: {
        employeeId: string;
        shiftId: string;
        effectiveFrom?: string;
    }): Promise<{
        id: any;
        employeeId: any;
        shiftId: any;
        status: any;
        effectiveFrom: any;
    }>;
    listAssignments(companyId: string): Promise<{
        assignments: any;
    }>;
    private toResponse;
}
