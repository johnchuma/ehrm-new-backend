import { ProgramService } from '../../../training-service/src/programs/programs.service';
import { EnrollmentService } from '../../../training-service/src/enrollments/enrollments.service';
import { CertificationService } from '../../../training-service/src/certifications/certifications.service';
export declare class TrainingController {
    private readonly progService;
    private readonly enrService;
    private readonly certService;
    constructor(progService: ProgramService, enrService: EnrollmentService, certService: CertificationService);
    createProg(body: any): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        category: any;
        trainer: any;
        startDate: any;
        endDate: any;
        location: any;
        maxParticipants: any;
        enrolled: any;
        status: any;
        createdAt: any;
    }>;
    listProgs(query: any): Promise<{
        programs: any;
    }>;
    getProg(id: string): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        category: any;
        trainer: any;
        startDate: any;
        endDate: any;
        location: any;
        maxParticipants: any;
        enrolled: any;
        status: any;
        createdAt: any;
    }>;
    updateProg(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        title: any;
        description: any;
        category: any;
        trainer: any;
        startDate: any;
        endDate: any;
        location: any;
        maxParticipants: any;
        enrolled: any;
        status: any;
        createdAt: any;
    }>;
    deleteProg(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    enroll(body: any): Promise<{
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
    listEnr(query: any): Promise<{
        enrollments: any;
    }>;
    updateEnr(id: string, body: any): Promise<{
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
    issueCert(body: any): Promise<{
        id: any;
        employeeId: any;
        employeeName: any;
        programId: any;
        programTitle: any;
        certificateNumber: any;
        issuedDate: any;
        expiryDate: any;
    }>;
    listCerts(query: any): Promise<{
        certifications: any;
    }>;
}
