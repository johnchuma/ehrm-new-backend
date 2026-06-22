import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class WebhookService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const w = await this.prisma.webhook.create({ data: { ...data, events: data.events.join(',') } });
    return this.toResponse(w);
  }

  async list(companyId: string) {
    const items = await this.prisma.webhook.findMany({ where: { companyId } });
    return { webhooks: items.map((w) => this.toResponse(w)) };
  }

  async delete(id: string) {
    await this.prisma.webhook.delete({ where: { id } });
    return { success: true, message: 'Webhook deleted' };
  }

  private toResponse(w: any) {
    return {
      id: w.id, companyId: w.companyId, url: w.url,
      events: w.events ? w.events.split(',') : [],
      secret: w.secret, status: w.status,
      createdAt: w.createdAt?.toISOString() || '',
    };
  }
}
