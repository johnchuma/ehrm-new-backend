import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @GrpcMethod('CompanySettingsService', 'GetSettings')
  get(data: { companyId: string }) { return this.service.getSettings(data.companyId); }

  @GrpcMethod('CompanySettingsService', 'UpdateSettings')
  update(data: { companyId: string } & any) { return this.service.updateSettings(data.companyId, data); }
}
