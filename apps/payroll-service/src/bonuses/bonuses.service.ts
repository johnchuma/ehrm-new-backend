import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class BonusService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const b = await this.prisma.bonus.create({ data });
    return this.toResponse(b);
  }

  async list(companyId: string, type?: string) {
    const where: any = { companyId };
    if (type) where.type = type;
    const items = await this.prisma.bonus.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { bonuses: items.map((b) => this.toResponse(b)) };
  }

  private toResponse(b: any) {
    return {
      id: b.id, companyId: b.companyId, employeeId: b.employeeId,
      employeeName: b.employeeName, type: b.type, amount: b.amount,
      period: b.period, status: b.status, notes: b.notes,
    };
  }
}
