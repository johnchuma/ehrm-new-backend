import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class PromotionService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const p = await this.prisma.promotion.create({
      data: { ...data, effectiveDate: new Date(data.effectiveDate) },
    });
    return this.toResponse(p);
  }

  async approve(id: string, status: string) {
    const p = await this.prisma.promotion.update({ where: { id }, data: { status } });
    return this.toResponse(p);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const items = await this.prisma.promotion.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { promotions: items.map((p) => this.toResponse(p)) };
  }

  private toResponse(p: any) {
    return {
      id: p.id, companyId: p.companyId, employeeId: p.employeeId,
      employeeName: p.employeeName, fromTitle: p.fromTitle, toTitle: p.toTitle,
      fromGrade: p.fromGrade, toGrade: p.toGrade, newSalary: p.newSalary,
      effectiveDate: p.effectiveDate?.toISOString() || '',
      reason: p.reason, status: p.status, createdAt: p.createdAt?.toISOString() || '',
    };
  }
}
