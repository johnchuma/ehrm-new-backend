import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OvertimeService } from './overtime.service';

@Controller()
export class OvertimeController {
  constructor(private readonly service: OvertimeService) {}

  @GrpcMethod('OvertimeService', 'CreateOvertime')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('OvertimeService', 'ApproveOvertime')
  approve(data: { id: string; status: string }) { return this.service.approve(data.id, data.status); }

  @GrpcMethod('OvertimeService', 'ListOvertime')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
