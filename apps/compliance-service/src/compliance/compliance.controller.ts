import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ComplianceService } from './compliance.service';

@Controller()
export class ComplianceController {
  constructor(private readonly service: ComplianceService) {}

  @GrpcMethod('ComplianceService', 'CreateRequirement')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('ComplianceService', 'GetRequirement')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('ComplianceService', 'UpdateRequirement')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('ComplianceService', 'ListRequirements')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
