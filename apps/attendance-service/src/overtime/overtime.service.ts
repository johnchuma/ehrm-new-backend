import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class OvertimeService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const ot = await this.prisma.overtime.create({
      data: { ...data, date: new Date(data.date) },
    });
    return this.toResponse(ot);
  }

  async approve(id: string, status: string) {
    const ot = await this.prisma.overtime.update({
      where: { id },
      data: { status, approvedAt: new Date() },
    });
    return this.toResponse(ot);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const ots = await this.prisma.overtime.findMany({ where, orderBy: { submittedAt: 'desc' } });
    return { overtime: ots.map((o) => this.toResponse(o)) };
  }

  private toResponse(o: any) {
    return {
      id: o.id, employeeId: o.employeeId, date: o.date?.toISOString() || '',
      hours: o.hours, rate: o.rate, reason: o.reason, status: o.status,
      submittedAt: o.submittedAt?.toISOString() || '',
    };
  }
}
