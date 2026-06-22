import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class ExceptionService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const exc = await this.prisma.attendanceException.create({
      data: { ...data, date: new Date(data.date) },
    });
    return this.toResponse(exc);
  }

  async resolve(id: string, notes?: string) {
    const exc = await this.prisma.attendanceException.update({
      where: { id },
      data: { status: 'Resolved', notes, resolvedAt: new Date() },
    });
    return this.toResponse(exc);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const exceptions = await this.prisma.attendanceException.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { exceptions: exceptions.map((e) => this.toResponse(e)) };
  }

  private toResponse(e: any) {
    return {
      id: e.id, employeeId: e.employeeId, type: e.type, date: e.date?.toISOString() || '',
      details: e.details, severity: e.severity, flagged: e.flagged,
      status: e.status, createdAt: e.createdAt?.toISOString() || '',
    };
  }
}
