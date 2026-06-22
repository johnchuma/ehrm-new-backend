import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class LeaveRequestService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const days = data.days || this.calculateDays(data.from, data.to);

    const type = await this.prisma.leaveType.findUnique({ where: { id: data.leaveTypeId } });
    if (!type) throw GrpcErrors.NOT_FOUND('Leave type not found');

    const balance = await this.prisma.leaveBalance.findFirst({
      where: { employeeId: data.employeeId, leaveTypeId: data.leaveTypeId },
    });

    if (balance && balance.available < days) {
      throw GrpcErrors.FAILED_PRECONDITION(`Insufficient leave balance. Available: ${balance.available} days`);
    }

    const req = await this.prisma.leaveRequest.create({
      data: {
        companyId: data.companyId,
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        from: new Date(data.from),
        to: new Date(data.to),
        days,
        reason: data.reason,
        status: 'Pending',
      },
    });

    return this.toResponse(req, type.name);
  }

  async approve(id: string, approverId: string, comments?: string) {
    const req = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!req) throw GrpcErrors.NOT_FOUND('Leave request not found');

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'Approved', approverId, comments },
    });

    await this.prisma.leaveBalance.updateMany({
      where: { employeeId: req.employeeId, leaveTypeId: req.leaveTypeId },
      data: { used: { increment: req.days }, available: { decrement: req.days } },
    });

    const type = await this.prisma.leaveType.findUnique({ where: { id: req.leaveTypeId } });
    return this.toResponse(updated, type?.name || '');
  }

  async reject(id: string, approverId: string, reason: string) {
    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'Rejected', approverId, comments: reason },
    });
    const type = await this.prisma.leaveType.findUnique({ where: { id: updated.leaveTypeId } });
    return this.toResponse(updated, type?.name || '');
  }

  async get(id: string) {
    const req = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!req) throw GrpcErrors.NOT_FOUND('Leave request not found');
    const type = await this.prisma.leaveType.findUnique({ where: { id: req.leaveTypeId } });
    return this.toResponse(req, type?.name || '');
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50;
    const [requests, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        include: { },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);
    const types = await this.prisma.leaveType.findMany({ where: { companyId } });
    const typeMap = new Map(types.map((t) => [t.id, t.name]));
    return { requests: requests.map((r) => this.toResponse(r, (typeMap.get(r.leaveTypeId) as string) || '')), total };
  }

  async getCalendarEvents(companyId: string, year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    const requests = await this.prisma.leaveRequest.findMany({
      where: { companyId, from: { lte: end }, to: { gte: start }, status: 'Approved' },
    });
    const types = await this.prisma.leaveType.findMany({ where: { companyId } });
    const typeMap = new Map(types.map((t) => [t.id, t.name]));
    return { requests: requests.map((r) => this.toResponse(r, (typeMap.get(r.leaveTypeId) as string) || '')), total: requests.length };
  }

  private calculateDays(from: string, to: string): number {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  private toResponse(r: any, leaveTypeName: string) {
    return {
      id: r.id, companyId: r.companyId, employeeId: r.employeeId,
      leaveTypeId: r.leaveTypeId, leaveTypeName,
      from: r.from?.toISOString() || '', to: r.to?.toISOString() || '',
      days: r.days, reason: r.reason, status: r.status,
      createdAt: r.createdAt?.toISOString() || '',
      updatedAt: r.updatedAt?.toISOString() || '',
    };
  }
}
