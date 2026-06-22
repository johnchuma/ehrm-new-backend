import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class ContractService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const c = await this.prisma.contract.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        probationEndDate: data.probationEndDate ? new Date(data.probationEndDate) : null,
      },
    });
    return this.toResponse(c);
  }

  async get(id: string) {
    const c = await this.prisma.contract.findUnique({ where: { id } });
    if (!c) throw GrpcErrors.NOT_FOUND('Contract not found');
    return this.toResponse(c);
  }

  async update(id: string, data: any) {
    if (data.endDate) data.endDate = new Date(data.endDate);
    const c = await this.prisma.contract.update({ where: { id }, data });
    return this.toResponse(c);
  }

  async terminate(id: string, reason: string, terminationDate: string) {
    const c = await this.prisma.contract.update({
      where: { id },
      data: {
        status: 'Terminated',
        terminationReason: reason,
        terminatedAt: new Date(terminationDate),
      },
    });
    return this.toResponse(c);
  }

  async renew(id: string, newEndDate: string, newSalary: number) {
    const c = await this.prisma.contract.update({
      where: { id },
      data: { endDate: new Date(newEndDate), basicSalary: newSalary, status: 'Active' },
    });
    return this.toResponse(c);
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    const items = await this.prisma.contract.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { contracts: items.map((c) => this.toResponse(c)) };
  }

  private toResponse(c: any) {
    return {
      id: c.id, companyId: c.companyId, employeeId: c.employeeId,
      employeeName: c.employeeName, type: c.type,
      startDate: c.startDate?.toISOString() || '',
      endDate: c.endDate?.toISOString() || '',
      probationEndDate: c.probationEndDate?.toISOString() || '',
      basicSalary: c.basicSalary, terms: c.terms, status: c.status,
      createdAt: c.createdAt?.toISOString() || '',
      terminatedAt: c.terminatedAt?.toISOString() || '',
    };
  }
}
