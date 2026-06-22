import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class IntegrationService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const i = await this.prisma.integration.create({ data });
    return this.toResponse(i);
  }

  async get(id: string) {
    const i = await this.prisma.integration.findUnique({ where: { id } });
    if (!i) throw GrpcErrors.NOT_FOUND('Integration not found');
    return this.toResponse(i);
  }

  async update(id: string, data: any) {
    const i = await this.prisma.integration.update({ where: { id }, data });
    return this.toResponse(i);
  }

  async delete(id: string) {
    await this.prisma.integration.delete({ where: { id } });
    return { success: true, message: 'Integration deleted' };
  }

  async list(companyId: string, type?: string) {
    const where: any = { companyId };
    if (type) where.type = type;
    const items = await this.prisma.integration.findMany({ where });
    return { integrations: items.map((i) => this.toResponse(i)) };
  }

  async toggle(id: string, enabled: boolean) {
    const i = await this.prisma.integration.update({ where: { id }, data: { enabled } });
    return this.toResponse(i);
  }

  private toResponse(i: any) {
    return {
      id: i.id, companyId: i.companyId, name: i.name, type: i.type,
      provider: i.provider, config: i.config, status: i.status,
      enabled: i.enabled, lastSyncAt: i.lastSyncAt?.toISOString() || '',
      createdAt: i.createdAt?.toISOString() || '',
    };
  }
}
