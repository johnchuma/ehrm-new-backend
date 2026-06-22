import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BonusService } from './bonuses.service';

@Controller()
export class BonusController {
  constructor(private readonly service: BonusService) {}

  @GrpcMethod('BonusService', 'CreateBonus')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('BonusService', 'ListBonuses')
  list(data: { companyId: string; type?: string }) { return this.service.list(data.companyId, data.type); }
}
