import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { IntegrationService } from './integrations/integrations.service';
import { WebhookService } from './webhooks/webhooks.service';

const SERVICE_NAME = 'integrations';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    IntegrationService, WebhookService,
  ],
  exports: [IntegrationService, WebhookService],
})
export class IntegrationsModule {}
