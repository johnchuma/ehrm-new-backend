import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CaseService } from './cases.service';

@Controller()
export class CaseController {
  constructor(private readonly service: CaseService) {}

  @GrpcMethod('DisciplinaryService', 'CreateCase')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('DisciplinaryService', 'GetCase')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('DisciplinaryService', 'UpdateCase')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('DisciplinaryService', 'ListCases')
  list(data: { companyId: string; status?: string; severity?: string }) { return this.service.list(data.companyId, data); }
}
