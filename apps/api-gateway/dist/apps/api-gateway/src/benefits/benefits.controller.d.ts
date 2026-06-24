import { BenefitService } from '../../../benefits-service/src/benefits/benefits.service';
import { EnrollmentService } from '../../../benefits-service/src/enrollments/enrollments.service';
export declare class BenefitsController {
    private readonly benService;
    private readonly enrService;
    constructor(benService: BenefitService, enrService: EnrollmentService);
    create(body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        description: any;
        employeeContribution: any;
        employerContribution: any;
        eligibility: any;
        status: any;
        createdAt: any;
    }>;
    list(query: any): Promise<{
        benefits: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        description: any;
        employeeContribution: any;
        employerContribution: any;
        eligibility: any;
        status: any;
        createdAt: any;
    }>;
    update(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        description: any;
        employeeContribution: any;
        employerContribution: any;
        eligibility: any;
        status: any;
        createdAt: any;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    enroll(body: any): Promise<{
        id: any;
        benefitId: any;
        benefitName: any;
        employeeId: any;
        employeeName: any;
        effectiveDate: any;
        status: any;
        enrolledAt: any;
    }>;
    listEnr(query: any): Promise<{
        enrollments: any;
    }>;
}
