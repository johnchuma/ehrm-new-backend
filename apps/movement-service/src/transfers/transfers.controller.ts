import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TransferService } from './transfers.service';

@Controller()
export class TransferController {
  constructor(private readonly service: TransferService) {}

  @GrpcMethod('TransferService', 'CreateTransfer')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('TransferService', 'ApproveTransfer')
  approve(data: { id: string; status: string }) { return this.service.approve(data.id, data.status); }

  @GrpcMethod('TransferService', 'ListTransfers')
  list(data: { companyId: string; status?: string }) { return this.service.list(data.companyId, data.status); }
}
