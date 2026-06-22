import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OnboardingService } from './onboarding.service';

@Controller()
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  @GrpcMethod('OnboardingService', 'CreateOnboarding')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('OnboardingService', 'GetOnboarding')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('OnboardingService', 'UpdateOnboarding')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('OnboardingService', 'AdvanceStage')
  advance(data: { id: string; stage: string }) { return this.service.advanceStage(data.id, data.stage); }

  @GrpcMethod('OnboardingService', 'CompleteOnboarding')
  complete(data: { id: string }) { return this.service.complete(data.id); }

  @GrpcMethod('OnboardingService', 'ListOnboardings')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
