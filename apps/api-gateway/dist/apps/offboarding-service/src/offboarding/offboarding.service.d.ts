export declare class OffboardingService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
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
    update(id: string, data: any): Promise<{
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
    advanceClearance(id: string, department: string): Promise<{
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
    list(companyId: string, status?: string): Promise<{
        offboardings: any;
    }>;
    private toResponse;
}
