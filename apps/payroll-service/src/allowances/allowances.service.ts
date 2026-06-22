import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class AllowanceService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const a = await this.prisma.allowance.create({ data });
    return this.toResponse(a);
  }

  async list(companyId: string) {
    const items = await this.prisma.allowance.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
    return { allowances: items.map((a) => this.toResponse(a)) };
  }

  private toResponse(a: any) {
    return {
      id: a.id, companyId: a.companyId, employeeId: a.employeeId,
      employeeName: a.employeeName, code: a.code, amount: a.amount,
      month: a.month, year: a.year, notes: a.notes,
    };
  }
}
