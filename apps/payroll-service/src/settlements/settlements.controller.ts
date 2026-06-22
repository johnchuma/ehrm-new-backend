import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SettlementService } from './settlements.service';

@Controller()
export class SettlementController {
  constructor(private readonly service: SettlementService) {}

  @GrpcMethod('SettlementService', 'CreateSettlement')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('SettlementService', 'ApproveSettlement')
  approve(data: { id: string; status: string }) { return this.service.approve(data.id, data.status); }

  @GrpcMethod('SettlementService', 'ListSettlements')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
