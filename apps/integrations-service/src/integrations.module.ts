import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { IntegrationService } from './integrations/integrations.service';
import { WebhookService } from './webhooks/webhooks.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [IntegrationService, WebhookService],
  exports: [IntegrationService, WebhookService],
})
export class IntegrationsModule {}
