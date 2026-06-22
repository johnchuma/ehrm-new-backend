import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class ComplianceService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const r = await this.prisma.complianceRequirement.create({
      data: { ...data, dueDate: new Date(data.dueDate) },
    });
    return this.toResponse(r);
  }

  async get(id: string) {
    const r = await this.prisma.complianceRequirement.findUnique({ where: { id } });
    if (!r) throw GrpcErrors.NOT_FOUND('Requirement not found');
    return this.toResponse(r);
  }

  async update(id: string, data: any) {
    const r = await this.prisma.complianceRequirement.update({ where: { id }, data });
    return this.toResponse(r);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const items = await this.prisma.complianceRequirement.findMany({ where });
    return { requirements: items.map((r) => this.toResponse(r)) };
  }

  private toResponse(r: any) {
    return {
      id: r.id, companyId: r.companyId, name: r.name, description: r.description,
      authority: r.authority, frequency: r.frequency,
      dueDate: r.dueDate?.toISOString() || '', status: r.status,
      createdAt: r.createdAt?.toISOString() || '',
    };
  }
}
