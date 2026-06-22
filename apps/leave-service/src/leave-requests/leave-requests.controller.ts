import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LeaveRequestService } from './leave-requests.service';

@Controller()
export class LeaveRequestController {
  constructor(private readonly service: LeaveRequestService) {}

  @GrpcMethod('LeaveRequestService', 'CreateRequest')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('LeaveRequestService', 'ApproveRequest')
  approve(data: { id: string; approverId: string; comments?: string }) {
    return this.service.approve(data.id, data.approverId, data.comments);
  }

  @GrpcMethod('LeaveRequestService', 'RejectRequest')
  reject(data: { id: string; approverId: string; reason: string }) {
    return this.service.reject(data.id, data.approverId, data.reason);
  }

  @GrpcMethod('LeaveRequestService', 'GetRequest')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('LeaveRequestService', 'ListRequests')
  list(data: { companyId: string; employeeId?: string; status?: string; page?: number; pageSize?: number }) {
    return this.service.list(data.companyId, data);
  }

  @GrpcMethod('LeaveRequestService', 'GetCalendarEvents')
  calendar(data: { companyId: string; year: number; month: number }) {
    return this.service.getCalendarEvents(data.companyId, data.year, data.month);
  }
}
