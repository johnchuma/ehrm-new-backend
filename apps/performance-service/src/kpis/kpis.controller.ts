import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { KpiService } from './kpis.service';

@Controller()
export class KpiController {
  constructor(private readonly service: KpiService) {}

  @GrpcMethod('KpiService', 'CreateKpi')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('KpiService', 'GetKpi')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('KpiService', 'UpdateKpi')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('KpiService', 'ListKpis')
  list(data: { companyId: string; category?: string }) { return this.service.list(data.companyId, data.category); }
}
