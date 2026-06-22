import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class DeductionService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const d = await this.prisma.deduction.create({ data });
    return this.toResponse(d);
  }

  async list(companyId: string) {
    const items = await this.prisma.deduction.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
    return { deductions: items.map((d) => this.toResponse(d)) };
  }

  private toResponse(d: any) {
    return {
      id: d.id, companyId: d.companyId, employeeId: d.employeeId,
      employeeName: d.employeeName, code: d.code, amount: d.amount,
      month: d.month, year: d.year, notes: d.notes,
    };
  }
}
