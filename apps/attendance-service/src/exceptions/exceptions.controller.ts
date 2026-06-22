import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ExceptionService } from './exceptions.service';

@Controller()
export class ExceptionController {
  constructor(private readonly service: ExceptionService) {}

  @GrpcMethod('AttendanceExceptionService', 'CreateException')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('AttendanceExceptionService', 'ResolveException')
  resolve(data: { id: string; notes?: string }) { return this.service.resolve(data.id, data.notes); }

  @GrpcMethod('AttendanceExceptionService', 'ListExceptions')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
