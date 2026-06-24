export declare class QualificationService {
    private readonly prisma;
    constructor(prisma: any);
    addEducation(data: any): Promise<{
        id: any;
        employeeId: any;
        institution: any;
        qualification: any;
        award: any;
        year: any;
    }>;
    addProfessionalQualification(data: any): Promise<{
        id: any;
        employeeId: any;
        name: any;
        authority: any;
        licenseNumber: any;
        expiry: any;
    }>;
    listEducation(employeeId: string): Promise<{
        education: any;
    }>;
    listQualifications(employeeId: string): Promise<{
        qualifications: any;
    }>;
}
