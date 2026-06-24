export declare class EnrollmentService {
    private readonly prisma;
    constructor(prisma: any);
    enroll(data: {
        programId: string;
        employeeId: string;
    }): Promise<{
        id: any;
        programId: any;
        programTitle: any;
        employeeId: any;
        employeeName: any;
        status: any;
        score: any;
        feedback: any;
        enrolledAt: any;
        completedAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        programId: any;
        programTitle: any;
        employeeId: any;
        employeeName: any;
        status: any;
        score: any;
        feedback: any;
        enrolledAt: any;
        completedAt: any;
    }>;
    list(programId?: string, employeeId?: string): Promise<{
        enrollments: any;
    }>;
    private toResponse;
}
