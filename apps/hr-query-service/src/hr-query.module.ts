import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { HRQueryService } from './hr-query/hr-query.service';
import { TicketService } from './tickets/tickets.service';

const SERVICE_NAME = 'hr-query';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    HRQueryService, TicketService,
  ],
  exports: [HRQueryService, TicketService],
})
export class HRQueryModule {}
