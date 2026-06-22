import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class ShiftService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const shift = await this.prisma.shift.create({ data });
    return this.toResponse(shift);
  }

  async get(id: string) {
    const s = await this.prisma.shift.findUnique({ where: { id } });
    if (!s) throw GrpcErrors.NOT_FOUND('Shift not found');
    return this.toResponse(s);
  }

  async update(id: string, data: any) {
    const s = await this.prisma.shift.update({ where: { id }, data });
    return this.toResponse(s);
  }

  async delete(id: string) {
    await this.prisma.shift.delete({ where: { id } });
    return { success: true, message: 'Shift deleted' };
  }

  async list(companyId: string) {
    const shifts = await this.prisma.shift.findMany({ where: { companyId }, orderBy: { name: 'asc' } });
    return { shifts: shifts.map((s) => this.toResponse(s)) };
  }

  async assign(data: { employeeId: string; shiftId: string; effectiveFrom?: string }) {
    const assignment = await this.prisma.shiftAssignment.create({
      data: { ...data, effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date() },
    });
    return {
      id: assignment.id, employeeId: assignment.employeeId, shiftId: assignment.shiftId,
      status: assignment.status, effectiveFrom: assignment.effectiveFrom?.toISOString() || '',
    };
  }

  async listAssignments(companyId: string) {
    const assignments = await this.prisma.shiftAssignment.findMany({
      where: { shift: { companyId } },
      orderBy: { createdAt: 'desc' },
    });
    return { assignments: assignments.map((a) => ({
      id: a.id, employeeId: a.employeeId, shiftId: a.shiftId,
      status: a.status, effectiveFrom: a.effectiveFrom?.toISOString() || '',
    })) };
  }

  private toResponse(s: any) {
    return {
      id: s.id, companyId: s.companyId, name: s.name, startTime: s.startTime,
      endTime: s.endTime, type: s.type, graceMinutes: s.graceMinutes, color: s.color,
    };
  }
}
