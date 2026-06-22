import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ClearanceService } from './clearance.service';

@Controller()
export class ClearanceController {
  constructor(private readonly service: ClearanceService) {}

  @GrpcMethod('ClearanceService', 'CreateClearance')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('ClearanceService', 'ApproveClearance')
  approve(data: { id: string; status: string; notes?: string }) { return this.service.approve(data.id, data.status, data.notes); }

  @GrpcMethod('ClearanceService', 'ListClearances')
  list(data: { offboardingId: string }) { return this.service.list(data.offboardingId); }
}
