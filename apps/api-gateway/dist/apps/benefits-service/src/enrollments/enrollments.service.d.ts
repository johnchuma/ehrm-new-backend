export declare class EnrollmentService {
    private readonly prisma;
    constructor(prisma: any);
    enroll(data: any): Promise<{
        id: any;
        benefitId: any;
        benefitName: any;
        employeeId: any;
        employeeName: any;
        effectiveDate: any;
        status: any;
        enrolledAt: any;
    }>;
    list(companyId?: string, employeeId?: string): Promise<{
        enrollments: any;
    }>;
    private toResponse;
}
