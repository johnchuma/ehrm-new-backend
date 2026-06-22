import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SalaryIntelligenceService } from './salary-intelligence.service';

@Controller()
export class SalaryIntelligenceController {
  constructor(private readonly service: SalaryIntelligenceService) {}

  @GrpcMethod('SalaryIntelligenceService', 'GetBenchmarks')
  benchmarks(data: { companyId: string; jobTitle: string; department: string }) {
    return this.service.getBenchmarks(data.companyId, data.jobTitle, data.department);
  }

  @GrpcMethod('SalaryIntelligenceService', 'GetCompensationAnalysis')
  compensation(data: { companyId: string; departmentId?: string }) {
    return this.service.getCompensationAnalysis(data.companyId, data.departmentId);
  }

  @GrpcMethod('SalaryIntelligenceService', 'GetSalaryStructure')
  structure(data: { companyId: string }) {
    return this.service.getSalaryStructure(data.companyId);
  }

  @GrpcMethod('SalaryIntelligenceService', 'SimulateSalary')
  simulate(data: { companyId: string; employeeId: string; proposedSalary: number; reason?: string }) {
    return this.service.simulateSalary(data.companyId, data.employeeId, data.proposedSalary);
  }
}
