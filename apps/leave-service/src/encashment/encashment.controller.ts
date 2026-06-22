import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EncashmentService } from './encashment.service';

@Controller()
export class EncashmentController {
  constructor(private readonly service: EncashmentService) {}

  @GrpcMethod('LeaveEncashmentService', 'CreateEncashment')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('LeaveEncashmentService', 'ApproveEncashment')
  approve(data: { id: string; status: string }) { return this.service.approve(data.id, data.status); }

  @GrpcMethod('LeaveEncashmentService', 'ListEncashments')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
