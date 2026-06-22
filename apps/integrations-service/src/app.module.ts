import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { IntegrationController } from './integrations/integrations.controller';
import { WebhookController } from './webhooks/webhooks.controller';
import { IntegrationService } from './integrations/integrations.service';
import { WebhookService } from './webhooks/webhooks.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('integrations')],
  controllers: [IntegrationController, WebhookController],
  providers: [IntegrationService, WebhookService],
})
export class AppModule {}
