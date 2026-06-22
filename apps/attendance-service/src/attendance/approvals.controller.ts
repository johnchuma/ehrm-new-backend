import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApprovalService } from './approvals.service';

@Controller()
export class ApprovalController {
  constructor(private readonly service: ApprovalService) {}

  @GrpcMethod('AttendanceApprovalService', 'CreateApproval')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('AttendanceApprovalService', 'DecideApproval')
  decide(data: { id: string; status: string; notes?: string }) { return this.service.decide(data.id, data.status); }

  @GrpcMethod('AttendanceApprovalService', 'ListApprovals')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
