import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { IntegrationService } from './integrations.service';

@Controller()
export class IntegrationController {
  constructor(private readonly service: IntegrationService) {}

  @GrpcMethod('IntegrationService', 'CreateIntegration')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('IntegrationService', 'GetIntegration')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('IntegrationService', 'UpdateIntegration')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('IntegrationService', 'DeleteIntegration')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('IntegrationService', 'ListIntegrations')
  list(data: { companyId: string; type?: string }) { return this.service.list(data.companyId, data.type); }

  @GrpcMethod('IntegrationService', 'ToggleIntegration')
  toggle(data: { id: string; enabled: boolean }) { return this.service.toggle(data.id, data.enabled); }
}
