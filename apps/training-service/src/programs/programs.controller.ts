import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProgramService } from './programs.service';

@Controller()
export class ProgramController {
  constructor(private readonly service: ProgramService) {}

  @GrpcMethod('ProgramService', 'CreateProgram')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('ProgramService', 'GetProgram')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('ProgramService', 'UpdateProgram')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('ProgramService', 'DeleteProgram')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('ProgramService', 'ListPrograms')
  list(data: { companyId: string; status?: string; category?: string }) { return this.service.list(data.companyId, data); }
}
