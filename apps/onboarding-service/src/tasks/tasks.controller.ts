import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OnboardingTaskService } from './tasks.service';

@Controller()
export class OnboardingTaskController {
  constructor(private readonly service: OnboardingTaskService) {}

  @GrpcMethod('OnboardingTaskService', 'CreateTask')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('OnboardingTaskService', 'CompleteTask')
  complete(data: { id: string }) { return this.service.complete(data.id); }

  @GrpcMethod('OnboardingTaskService', 'ListTasks')
  list(data: { onboardingId: string }) { return this.service.list(data.onboardingId); }
}
