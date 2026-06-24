export declare class CertificationService {
    private readonly prisma;
    constructor(prisma: any);
    issue(data: any): Promise<{
        id: any;
        employeeId: any;
        employeeName: any;
        programId: any;
        programTitle: any;
        certificateNumber: any;
        issuedDate: any;
        expiryDate: any;
    }>;
    list(employeeId?: string, companyId?: string): Promise<{
        certifications: any;
    }>;
    private toResponse;
}
