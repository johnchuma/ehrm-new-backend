import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LeaveTypeService } from './leave-types.service';

@Controller()
export class LeaveTypeController {
  constructor(private readonly service: LeaveTypeService) {}

  @GrpcMethod('LeaveTypeService', 'CreateType')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('LeaveTypeService', 'GetType')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('LeaveTypeService', 'UpdateType')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('LeaveTypeService', 'DeleteType')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('LeaveTypeService', 'ListTypes')
  list(data: { companyId: string }) { return this.service.list(data.companyId); }
}
