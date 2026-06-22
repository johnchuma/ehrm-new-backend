import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class OffboardingService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const o = await this.prisma.offboarding.create({
      data: {
        ...data,
        lastWorkingDay: new Date(data.lastWorkingDay),
        noticeDate: new Date(data.noticeDate),
      },
    });
    return this.toResponse(o);
  }

  async get(id: string) {
    const o = await this.prisma.offboarding.findUnique({ where: { id } });
    if (!o) throw GrpcErrors.NOT_FOUND('Offboarding not found');
    return this.toResponse(o);
  }

  async update(id: string, data: any) {
    const o = await this.prisma.offboarding.update({ where: { id }, data });
    return this.toResponse(o);
  }

  async advanceClearance(id: string, department: string) {
    const o = await this.prisma.offboarding.findUnique({ where: { id } });
    if (!o) throw GrpcErrors.NOT_FOUND('Offboarding not found');
    const updated = await this.prisma.offboarding.update({ where: { id }, data: { notes: `Clearance: ${department}` } });
    return this.toResponse(updated);
  }

  async complete(id: string) {
    const o = await this.prisma.offboarding.update({
      where: { id },
      data: { status: 'Completed', completedAt: new Date() },
    });
    return this.toResponse(o);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const items = await this.prisma.offboarding.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { offboardings: items.map((o) => this.toResponse(o)) };
  }

  private toResponse(o: any) {
    return {
      id: o.id, companyId: o.companyId, employeeId: o.employeeId,
      employeeName: o.employeeName, reason: o.reason, type: o.type,
      lastWorkingDay: o.lastWorkingDay?.toISOString() || '',
      noticeDate: o.noticeDate?.toISOString() || '',
      status: o.status, createdAt: o.createdAt?.toISOString() || '',
      completedAt: o.completedAt?.toISOString() || '',
    };
  }
}
