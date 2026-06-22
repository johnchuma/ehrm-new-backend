import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class AnnouncementService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const a = await this.prisma.announcement.create({
      data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    return this.toResponse(a);
  }

  async get(id: string) {
    const a = await this.prisma.announcement.findUnique({ where: { id } });
    if (!a) throw GrpcErrors.NOT_FOUND('Announcement not found');
    return this.toResponse(a);
  }

  async update(id: string, data: any) {
    if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    const a = await this.prisma.announcement.update({ where: { id }, data });
    return this.toResponse(a);
  }

  async delete(id: string) {
    await this.prisma.announcement.delete({ where: { id } });
    return { success: true, message: 'Announcement deleted' };
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.type) where.type = filters.type;
    if (filters.priority) where.priority = filters.priority;
    const items = await this.prisma.announcement.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { announcements: items.map((a) => this.toResponse(a)) };
  }

  private toResponse(a: any) {
    return {
      id: a.id, companyId: a.companyId, title: a.title, content: a.content,
      type: a.type, priority: a.priority, audience: a.audience,
      publishedAt: a.publishedAt?.toISOString() || '',
      expiresAt: a.expiresAt?.toISOString() || '',
      authorId: a.authorId, createdAt: a.createdAt?.toISOString() || '',
    };
  }
}
