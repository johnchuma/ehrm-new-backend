import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class SettlementService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const s = await this.prisma.settlement.create({
      data: { ...data, effectiveDate: new Date(data.effectiveDate) },
    });
    return this.toResponse(s);
  }

  async approve(id: string, status: string) {
    const s = await this.prisma.settlement.update({ where: { id }, data: { status } });
    return this.toResponse(s);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const items = await this.prisma.settlement.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { settlements: items.map((s) => this.toResponse(s)) };
  }

  private toResponse(s: any) {
    return {
      id: s.id, companyId: s.companyId, employeeId: s.employeeId,
      employeeName: s.employeeName, type: s.type, amount: s.amount,
      reason: s.reason, effectiveDate: s.effectiveDate?.toISOString() || '',
      status: s.status, createdAt: s.createdAt?.toISOString() || '',
    };
  }
}
