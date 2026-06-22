import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class AssetService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const a = await this.prisma.asset.create({
      data: { ...data, purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null },
    });
    return this.toResponse(a);
  }

  async get(id: string) {
    const a = await this.prisma.asset.findUnique({ where: { id } });
    if (!a) throw GrpcErrors.NOT_FOUND('Asset not found');
    return this.toResponse(a);
  }

  async update(id: string, data: any) {
    const a = await this.prisma.asset.update({ where: { id }, data });
    return this.toResponse(a);
  }

  async delete(id: string) {
    await this.prisma.asset.delete({ where: { id } });
    return { success: true, message: 'Asset deleted' };
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    const items = await this.prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { assets: items.map((a) => this.toResponse(a)) };
  }

  private toResponse(a: any) {
    return {
      id: a.id, companyId: a.companyId, name: a.name, category: a.category,
      serialNumber: a.serialNumber, model: a.model,
      purchaseDate: a.purchaseDate?.toISOString() || '',
      purchasePrice: a.purchasePrice, status: a.status, condition: a.condition,
      location: a.location, assignedTo: a.assignedTo,
      createdAt: a.createdAt?.toISOString() || '',
    };
  }
}
