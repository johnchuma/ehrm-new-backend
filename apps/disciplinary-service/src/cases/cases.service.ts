import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class CaseService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const c = await this.prisma.disciplinaryCase.create({
      data: { ...data, date: new Date(data.date) },
    });
    return this.toResponse(c);
  }

  async get(id: string) {
    const c = await this.prisma.disciplinaryCase.findUnique({ where: { id } });
    if (!c) throw GrpcErrors.NOT_FOUND('Case not found');
    return this.toResponse(c);
  }

  async update(id: string, data: any) {
    const c = await this.prisma.disciplinaryCase.update({ where: { id }, data });
    return this.toResponse(c);
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    const items = await this.prisma.disciplinaryCase.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { cases: items.map((c) => this.toResponse(c)) };
  }

  private toResponse(c: any) {
    return {
      id: c.id, companyId: c.companyId, employeeId: c.employeeId,
      employeeName: c.employeeName, incident: c.incident, description: c.description,
      date: c.date?.toISOString() || '', reportedBy: c.reportedBy,
      severity: c.severity, status: c.status,
      createdAt: c.createdAt?.toISOString() || '',
    };
  }
}
