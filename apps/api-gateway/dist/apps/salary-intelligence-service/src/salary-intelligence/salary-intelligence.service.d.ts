export declare class SalaryIntelligenceService {
    private readonly prisma;
    constructor(prisma: any);
    getBenchmarks(companyId: string, jobTitle: string, department: string): Promise<{
        jobTitle: string;
        department: string;
        marketMin: number;
        marketMedian: number;
        marketMax: number;
        companyAverage: number;
        percentile: number;
        recommendation: string;
    }>;
    getCompensationAnalysis(companyId: string, departmentId?: string): Promise<{
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
    getSalaryStructure(companyId: string): Promise<{
        grades: {
            grade: string;
            level: string;
            minSalary: number;
            midSalary: number;
            maxSalary: number;
            description: string;
        }[];
    }>;
    simulateSalary(companyId: string, employeeId: string, proposedSalary: number): Promise<{
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
