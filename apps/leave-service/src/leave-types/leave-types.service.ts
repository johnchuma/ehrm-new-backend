import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class LeaveTypeService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const type = await this.prisma.leaveType.create({ data });
    return this.toResponse(type);
  }

  async get(id: string) {
    const t = await this.prisma.leaveType.findUnique({ where: { id } });
    if (!t) throw GrpcErrors.NOT_FOUND('Leave type not found');
    return this.toResponse(t);
  }

  async update(id: string, data: any) {
    const t = await this.prisma.leaveType.update({ where: { id }, data });
    return this.toResponse(t);
  }

  async delete(id: string) {
    await this.prisma.leaveType.delete({ where: { id } });
    return { success: true, message: 'Leave type deleted' };
  }

  async list(companyId: string) {
    const types = await this.prisma.leaveType.findMany({ where: { companyId }, orderBy: { name: 'asc' } });
    return { types: types.map((t) => this.toResponse(t)) };
  }

  private toResponse(t: any) {
    return {
      id: t.id, companyId: t.companyId, name: t.name,
      entitlementDays: t.entitlementDays, color: t.color, accrual: t.accrual,
      carryForward: t.carryForward, eligibility: t.eligibility, maxCarry: t.maxCarry,
      createdAt: t.createdAt?.toISOString() || '',
    };
  }
}
