import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DeductionService } from './deductions.service';

@Controller()
export class DeductionController {
  constructor(private readonly service: DeductionService) {}

  @GrpcMethod('DeductionService', 'CreateDeduction')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('DeductionService', 'ListDeductions')
  list(data: { companyId: string }) { return this.service.list(data.companyId); }
}
