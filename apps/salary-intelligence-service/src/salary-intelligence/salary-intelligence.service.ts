import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class SalaryIntelligenceService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async getBenchmarks(companyId: string, jobTitle: string, department: string) {
    return {
      jobTitle,
      department,
      marketMin: 1500000,
      marketMedian: 2200000,
      marketMax: 3500000,
      companyAverage: 2100000,
      percentile: 55,
      recommendation: 'Your current salary is at the 55th percentile. Consider a 10% adjustment to align with market median.',
    };
  }

  async getCompensationAnalysis(companyId: string, departmentId?: string) {
    return {
      department: 'Operations',
      employees: 320,
      averageSalary: 1812500,
      medianSalary: 1700000,
      minSalary: 800000,
      maxSalary: 4500000,
      totalCost: 580000000,
      gradeDistribution: [
        { grade: 'G1', count: 15, average: 4200000 },
        { grade: 'G2', count: 35, average: 3200000 },
        { grade: 'G3', count: 120, average: 2200000 },
        { grade: 'G4', count: 100, average: 1400000 },
        { grade: 'G5', count: 50, average: 900000 },
      ],
    };
  }

  async getSalaryStructure(companyId: string) {
    return {
      grades: [
        { grade: 'G1', level: 'Senior Management', minSalary: 3500000, midSalary: 4500000, maxSalary: 6000000, description: 'Directors, Senior Managers' },
        { grade: 'G2', level: 'Middle Management', minSalary: 2500000, midSalary: 3200000, maxSalary: 4000000, description: 'Managers, Department Heads' },
        { grade: 'G3', level: 'Senior Professional', minSalary: 1800000, midSalary: 2200000, maxSalary: 2800000, description: 'Senior Officers, Specialists' },
        { grade: 'G4', level: 'Professional', minSalary: 1200000, midSalary: 1500000, maxSalary: 2000000, description: 'Officers, Assistants' },
        { grade: 'G5', level: 'Support', minSalary: 700000, midSalary: 900000, maxSalary: 1200000, description: 'Support Staff, Operators' },
      ],
    };
  }

  async simulateSalary(companyId: string, employeeId: string, proposedSalary: number) {
    const currentSalary = 1800000;
    const increase = proposedSalary - currentSalary;
    const increasePercent = (increase / currentSalary) * 100;
    return {
      employeeId,
      currentSalary,
      proposedSalary,
      increase,
      increasePercent: Math.round(increasePercent * 100) / 100,
      monthlyImpact: increase,
      annualImpact: increase * 12,
      recommendation: increasePercent > 15 ? 'Consider phased implementation to manage budget impact.' : 'Within reasonable adjustment range.',
    };
  }
}
