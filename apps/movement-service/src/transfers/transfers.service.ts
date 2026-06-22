import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class TransferService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const t = await this.prisma.transfer.create({
      data: { ...data, effectiveDate: new Date(data.effectiveDate) },
    });
    return this.toResponse(t);
  }

  async approve(id: string, status: string) {
    const t = await this.prisma.transfer.update({ where: { id }, data: { status } });
    return this.toResponse(t);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const items = await this.prisma.transfer.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { transfers: items.map((t) => this.toResponse(t)) };
  }

  private toResponse(t: any) {
    return {
      id: t.id, companyId: t.companyId, employeeId: t.employeeId,
      employeeName: t.employeeName, fromBranchId: t.fromBranchId,
      fromDepartmentId: t.fromDepartmentId, toBranchId: t.toBranchId,
      toDepartmentId: t.toDepartmentId, effectiveDate: t.effectiveDate?.toISOString() || '',
      reason: t.reason, status: t.status, createdAt: t.createdAt?.toISOString() || '',
    };
  }
}
