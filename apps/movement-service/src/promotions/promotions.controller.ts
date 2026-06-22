import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PromotionService } from './promotions.service';

@Controller()
export class PromotionController {
  constructor(private readonly service: PromotionService) {}

  @GrpcMethod('PromotionService', 'CreatePromotion')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('PromotionService', 'ApprovePromotion')
  approve(data: { id: string; status: string }) { return this.service.approve(data.id, data.status); }

  @GrpcMethod('PromotionService', 'ListPromotions')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
