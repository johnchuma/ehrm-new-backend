import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WebhookService } from './webhooks.service';

@Controller()
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @GrpcMethod('WebhookService', 'CreateWebhook')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('WebhookService', 'ListWebhooks')
  list(data: { companyId: string }) { return this.service.list(data.companyId); }

  @GrpcMethod('WebhookService', 'DeleteWebhook')
  remove(data: { id: string }) { return this.service.delete(data.id); }
}
