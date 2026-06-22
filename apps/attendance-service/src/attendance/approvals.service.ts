import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class ApprovalService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const approval = await this.prisma.attendanceApproval.create({ data });
    return this.toResponse(approval);
  }

  async decide(id: string, status: string) {
    const approval = await this.prisma.attendanceApproval.update({
      where: { id },
      data: { status },
    });
    return this.toResponse(approval);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const approvals = await this.prisma.attendanceApproval.findMany({ where, orderBy: { submittedAt: 'desc' } });
    return { approvals: approvals.map((a) => this.toResponse(a)) };
  }

  private toResponse(a: any) {
    return {
      id: a.id, employeeId: a.employeeId, type: a.type, date: a.date?.toISOString() || '',
      detail: a.detail, reviewer: a.reviewer, status: a.status,
      submittedAt: a.submittedAt?.toISOString() || '',
    };
  }
}
