import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BlackoutService } from './blackouts.service';

@Controller()
export class BlackoutController {
  constructor(private readonly service: BlackoutService) {}

  @GrpcMethod('BlackoutPeriodService', 'CreateBlackout')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('BlackoutPeriodService', 'ListBlackouts')
  list(data: { companyId: string }) { return this.service.list(data.companyId); }
}
