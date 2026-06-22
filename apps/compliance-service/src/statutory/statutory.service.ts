import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class StatutoryService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const f = await this.prisma.statutoryFiling.create({
      data: { ...data, dueDate: new Date(data.dueDate) },
    });
    return this.toResponse(f);
  }

  async update(id: string, data: any) {
    if (data.filedDate) data.filedDate = new Date(data.filedDate);
    const f = await this.prisma.statutoryFiling.update({ where: { id }, data });
    return this.toResponse(f);
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    const items = await this.prisma.statutoryFiling.findMany({ where, orderBy: { dueDate: 'asc' } });
    return { filings: items.map((f) => this.toResponse(f)) };
  }

  private toResponse(f: any) {
    return {
      id: f.id, companyId: f.companyId, type: f.type, period: f.period,
      amount: f.amount, dueDate: f.dueDate?.toISOString() || '',
      authority: f.authority, status: f.status, reference: f.reference,
      filedDate: f.filedDate?.toISOString() || '',
      createdAt: f.createdAt?.toISOString() || '',
    };
  }
}
