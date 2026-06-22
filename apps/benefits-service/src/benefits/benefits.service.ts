import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class BenefitService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const b = await this.prisma.benefit.create({ data });
    return this.toResponse(b);
  }

  async get(id: string) {
    const b = await this.prisma.benefit.findUnique({ where: { id } });
    if (!b) throw GrpcErrors.NOT_FOUND('Benefit not found');
    return this.toResponse(b);
  }

  async update(id: string, data: any) {
    const b = await this.prisma.benefit.update({ where: { id }, data });
    return this.toResponse(b);
  }

  async delete(id: string) {
    await this.prisma.benefit.delete({ where: { id } });
    return { success: true, message: 'Benefit deleted' };
  }

  async list(companyId: string, type?: string) {
    const where: any = { companyId };
    if (type) where.type = type;
    const items = await this.prisma.benefit.findMany({ where });
    return { benefits: items.map((b) => this.toResponse(b)) };
  }

  private toResponse(b: any) {
    return {
      id: b.id, companyId: b.companyId, name: b.name, type: b.type,
      description: b.description, employeeContribution: b.employeeContribution,
      employerContribution: b.employerContribution, eligibility: b.eligibility,
      status: b.status, createdAt: b.createdAt?.toISOString() || '',
    };
  }
}
