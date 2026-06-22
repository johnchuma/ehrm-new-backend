import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class DocumentService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async upload(data: any) {
    const d = await this.prisma.document.create({
      data: { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
    });
    return this.toResponse(d);
  }

  async get(id: string) {
    const d = await this.prisma.document.findUnique({ where: { id } });
    if (!d) throw GrpcErrors.NOT_FOUND('Document not found');
    return this.toResponse(d);
  }

  async update(id: string, data: any) {
    const d = await this.prisma.document.update({ where: { id }, data });
    return this.toResponse(d);
  }

  async delete(id: string) {
    await this.prisma.document.delete({ where: { id } });
    return { success: true, message: 'Document deleted' };
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.category) where.category = filters.category;
    if (filters.type) where.type = filters.type;
    const items = await this.prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { documents: items.map((d) => this.toResponse(d)) };
  }

  async share(id: string, userIds: string[], expiresAt?: string) {
    const d = await this.prisma.document.update({
      where: { id },
      data: { sharedWith: userIds.join(','), expiresAt: expiresAt ? new Date(expiresAt) : null },
    });
    return this.toResponse(d);
  }

  private toResponse(d: any) {
    return {
      id: d.id, companyId: d.companyId, employeeId: d.employeeId,
      name: d.name, type: d.type, category: d.category, url: d.url,
      size: d.size, uploadedBy: d.uploadedBy, description: d.description,
      sharedWith: d.sharedWith ? d.sharedWith.split(',') : [],
      expiresAt: d.expiresAt?.toISOString() || '',
      createdAt: d.createdAt?.toISOString() || '',
      updatedAt: d.updatedAt?.toISOString() || '',
    };
  }
}
