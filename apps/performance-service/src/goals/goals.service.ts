import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class GoalService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const g = await this.prisma.goal.create({
      data: { ...data, targetDate: data.targetDate ? new Date(data.targetDate) : null },
    });
    return this.toResponse(g);
  }

  async get(id: string) {
    const g = await this.prisma.goal.findUnique({ where: { id } });
    if (!g) throw GrpcErrors.NOT_FOUND('Goal not found');
    return this.toResponse(g);
  }

  async update(id: string, data: any) {
    const g = await this.prisma.goal.update({ where: { id }, data });
    return this.toResponse(g);
  }

  async delete(id: string) {
    await this.prisma.goal.delete({ where: { id } });
    return { success: true, message: 'Goal deleted' };
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    const goals = await this.prisma.goal.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { goals: goals.map((g) => this.toResponse(g)) };
  }

  private toResponse(g: any) {
    return {
      id: g.id, companyId: g.companyId, employeeId: g.employeeId,
      employeeName: g.employeeName, title: g.title, description: g.description,
      category: g.category, targetDate: g.targetDate?.toISOString() || '',
      weight: g.weight, progress: g.progress, status: g.status,
      createdAt: g.createdAt?.toISOString() || '',
    };
  }
}
