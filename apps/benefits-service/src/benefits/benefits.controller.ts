import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BenefitService } from './benefits.service';

@Controller()
export class BenefitController {
  constructor(private readonly service: BenefitService) {}

  @GrpcMethod('BenefitService', 'CreateBenefit')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('BenefitService', 'GetBenefit')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('BenefitService', 'UpdateBenefit')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('BenefitService', 'DeleteBenefit')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('BenefitService', 'ListBenefits')
  list(data: { companyId: string; type?: string }) { return this.service.list(data.companyId, data.type); }
}
