import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AllowanceService } from './allowances.service';

@Controller()
export class AllowanceController {
  constructor(private readonly service: AllowanceService) {}

  @GrpcMethod('AllowanceService', 'CreateAllowance')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('AllowanceService', 'ListAllowances')
  list(data: { companyId: string }) { return this.service.list(data.companyId); }
}
