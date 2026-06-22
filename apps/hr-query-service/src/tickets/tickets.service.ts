import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class TicketService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async list(companyId: string, userId?: string, status?: string) {
    const where: any = { companyId };
    if (userId) where.userId = userId;
    if (status) where.status = status;
    const items = await this.prisma.hRTicket.findMany({
      where,
      include: { replies: true },
      orderBy: { createdAt: 'desc' },
    });
    return { tickets: items.map((t) => this.toResponse(t)) };
  }

  async create(data: any) {
    const t = await this.prisma.hRTicket.create({ data });
    return this.toResponse(t);
  }

  async reply(id: string, reply: string, userId: string) {
    await this.prisma.ticketReply.create({ data: { ticketId: id, userId, message: reply } });
    const t = await this.prisma.hRTicket.findUnique({ where: { id }, include: { replies: true } });
    return this.toResponse(t);
  }

  private toResponse(t: any) {
    return {
      id: t.id, companyId: t.companyId, userId: t.userId, userName: t.userName,
      subject: t.subject, description: t.description, category: t.category,
      priority: t.priority, status: t.status,
      replies: (t.replies || []).map((r: any) => ({
        id: r.id, userId: r.userId, userName: r.userName,
        message: r.message, createdAt: r.createdAt?.toISOString() || '',
      })),
      createdAt: t.createdAt?.toISOString() || '',
      closedAt: t.closedAt?.toISOString() || '',
    };
  }
}
