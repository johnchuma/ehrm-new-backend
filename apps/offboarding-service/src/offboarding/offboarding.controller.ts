import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OffboardingService } from './offboarding.service';

@Controller()
export class OffboardingController {
  constructor(private readonly service: OffboardingService) {}

  @GrpcMethod('OffboardingService', 'CreateOffboarding')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('OffboardingService', 'GetOffboarding')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('OffboardingService', 'UpdateOffboarding')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('OffboardingService', 'AdvanceClearance')
  advance(data: { id: string; department: string }) { return this.service.advanceClearance(data.id, data.department); }

  @GrpcMethod('OffboardingService', 'CompleteOffboarding')
  complete(data: { id: string }) { return this.service.complete(data.id); }

  @GrpcMethod('OffboardingService', 'ListOffboardings')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
