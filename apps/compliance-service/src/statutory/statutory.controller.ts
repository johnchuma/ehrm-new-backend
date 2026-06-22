import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { StatutoryService } from './statutory.service';

@Controller()
export class StatutoryController {
  constructor(private readonly service: StatutoryService) {}

  @GrpcMethod('StatutoryService', 'CreateFiling')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('StatutoryService', 'UpdateFiling')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('StatutoryService', 'ListFilings')
  list(data: { companyId: string; type?: string; status?: string }) { return this.service.list(data.companyId, data); }
}
