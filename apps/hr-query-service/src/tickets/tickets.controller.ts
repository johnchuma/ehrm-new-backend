import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TicketService } from './tickets.service';

@Controller()
export class TicketController {
  constructor(private readonly service: TicketService) {}

  @GrpcMethod('HRQueryService', 'ListTickets')
  list(data: { companyId: string; userId?: string; status?: string }) { return this.service.list(data.companyId, data.userId, data.status); }

  @GrpcMethod('HRQueryService', 'CreateTicket')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('HRQueryService', 'ReplyTicket')
  reply(data: { id: string; reply: string; userId: string }) { return this.service.reply(data.id, data.reply, data.userId); }
}
