import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ShiftService } from './shifts.service';

@Controller()
export class ShiftController {
  constructor(private readonly service: ShiftService) {}

  @GrpcMethod('ShiftService', 'CreateShift')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('ShiftService', 'GetShift')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('ShiftService', 'UpdateShift')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('ShiftService', 'DeleteShift')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('ShiftService', 'ListShifts')
  list(data: { companyId: string }) { return this.service.list(data.companyId); }

  @GrpcMethod('ShiftService', 'AssignShift')
  assign(data: any) { return this.service.assign(data); }

  @GrpcMethod('ShiftService', 'ListAssignments')
  listAssign(data: { companyId: string }) { return this.service.listAssignments(data.companyId); }
}
