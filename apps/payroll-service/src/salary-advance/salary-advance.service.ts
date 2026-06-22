import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class AdvanceService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const adv = await this.prisma.salaryAdvance.create({ data });
    return this.toResponse(adv);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const advs = await this.prisma.salaryAdvance.findMany({ where, orderBy: { disbursedAt: 'desc' } });
    return { advances: advs.map((a) => this.toResponse(a)) };
  }

  private toResponse(a: any) {
    return {
      id: a.id, companyId: a.companyId, employeeId: a.employeeId,
      employeeName: a.employeeName, amount: a.amount, termMonths: a.termMonths,
      status: a.status, disbursedAt: a.disbursedAt?.toISOString() || '', notes: a.notes,
    };
  }
}
