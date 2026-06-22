import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AssetService } from './assets.service';

@Controller()
export class AssetController {
  constructor(private readonly service: AssetService) {}

  @GrpcMethod('AssetService', 'CreateAsset')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('AssetService', 'GetAsset')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('AssetService', 'UpdateAsset')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('AssetService', 'DeleteAsset')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('AssetService', 'ListAssets')
  list(data: { companyId: string; category?: string; status?: string }) { return this.service.list(data.companyId, data); }
}
