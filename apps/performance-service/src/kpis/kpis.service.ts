import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class KpiService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const k = await this.prisma.kpi.create({ data });
    return this.toResponse(k);
  }

  async get(id: string) {
    const k = await this.prisma.kpi.findUnique({ where: { id } });
    if (!k) throw GrpcErrors.NOT_FOUND('KPI not found');
    return this.toResponse(k);
  }

  async update(id: string, data: any) {
    const k = await this.prisma.kpi.update({ where: { id }, data });
    return this.toResponse(k);
  }

  async list(companyId: string, category?: string) {
    const where: any = { companyId };
    if (category) where.category = category;
    const kpis = await this.prisma.kpi.findMany({ where });
    return { kpis: kpis.map((k) => this.toResponse(k)) };
  }

  private toResponse(k: any) {
    return {
      id: k.id, companyId: k.companyId, name: k.name, description: k.description,
      unit: k.unit, target: k.target, actual: k.actual,
      achievement: k.target > 0 ? Math.round((k.actual / k.target) * 100) : 0,
      category: k.category, createdAt: k.createdAt?.toISOString() || '',
    };
  }
}
