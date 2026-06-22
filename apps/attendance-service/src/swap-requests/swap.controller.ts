import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SwapService } from './swap.service';

@Controller()
export class SwapController {
  constructor(private readonly service: SwapService) {}

  @GrpcMethod('ShiftSwapService', 'CreateSwapRequest')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('ShiftSwapService', 'ApproveSwap')
  approve(data: { id: string; status: string }) { return this.service.approve(data.id, data.status); }

  @GrpcMethod('ShiftSwapService', 'ListSwaps')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
