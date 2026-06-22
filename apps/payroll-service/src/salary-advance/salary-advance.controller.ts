import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AdvanceService } from './salary-advance.service';

@Controller()
export class AdvanceController {
  constructor(private readonly service: AdvanceService) {}

  @GrpcMethod('SalaryAdvanceService', 'CreateAdvance')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('SalaryAdvanceService', 'ListAdvances')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
