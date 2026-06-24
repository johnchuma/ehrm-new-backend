import { SalaryIntelligenceService } from '../../../salary-intelligence-service/src/salary-intelligence/salary-intelligence.service';
export declare class SalaryIntelligenceController {
    private readonly salaryIntelligenceService;
    constructor(salaryIntelligenceService: SalaryIntelligenceService);
    benchmarks(query: any): Promise<{
        jobTitle: string;
        department: string;
        marketMin: number;
        marketMedian: number;
        marketMax: number;
        companyAverage: number;
        percentile: number;
        recommendation: string;
    }>;
    compensation(query: any): Promise<{
        department: string;
        employees: number;
        averageSalary: number;
        medianSalary: number;
        minSalary: number;
        maxSalary: number;
        totalCost: number;
        gradeDistribution: {
            grade: string;
            count: number;
            average: number;
        }[];
    }>;
    structure(companyId: string): Promise<{
        grades: {
            grade: string;
            level: string;
            minSalary: number;
            midSalary: number;
            maxSalary: number;
            description: string;
        }[];
    }>;
    simulate(body: any): Promise<{
        employeeId: string;
        currentSalary: number;
        proposedSalary: number;
        increase: number;
        increasePercent: number;
        monthlyImpact: number;
        annualImpact: number;
        recommendation: string;
    }>;
}
