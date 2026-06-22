import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class EncashmentService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const enc = await this.prisma.leaveEncashment.create({ data });
    return this.toResponse(enc);
  }

  async approve(id: string, status: string) {
    const enc = await this.prisma.leaveEncashment.update({
      where: { id },
      data: { status, processedAt: status === 'Processed' ? new Date() : null },
    });
    return this.toResponse(enc);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const encs = await this.prisma.leaveEncashment.findMany({ where, orderBy: { submittedAt: 'desc' } });
    return { encashments: encs.map((e) => this.toResponse(e)) };
  }

  private toResponse(e: any) {
    return {
      id: e.id, companyId: e.companyId, employeeId: e.employeeId,
      leaveTypeId: e.leaveTypeId, days: e.days, amount: e.amount,
      status: e.status, submittedAt: e.submittedAt?.toISOString() || '',
    };
  }
}
