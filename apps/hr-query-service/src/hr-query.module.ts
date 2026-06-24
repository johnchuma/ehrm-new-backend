import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { HRQueryService } from './hr-query/hr-query.service';
import { TicketService } from './tickets/tickets.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [HRQueryService, TicketService],
  exports: [HRQueryService, TicketService],
})
export class HRQueryModule {}
