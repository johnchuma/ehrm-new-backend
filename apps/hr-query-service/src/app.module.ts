import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { HRQueryController } from './hr-query/hr-query.controller';
import { TicketController } from './tickets/tickets.controller';
import { HRQueryService } from './hr-query/hr-query.service';
import { TicketService } from './tickets/tickets.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('hr-query')],
  controllers: [HRQueryController, TicketController],
  providers: [HRQueryService, TicketService],
})
export class AppModule {}
