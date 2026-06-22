import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class TaskService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const t = await this.prisma.task.create({
      data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null },
    });
    return this.toResponse(t);
  }

  async get(id: string) {
    const t = await this.prisma.task.findUnique({ where: { id } });
    if (!t) throw GrpcErrors.NOT_FOUND('Task not found');
    return this.toResponse(t);
  }

  async update(id: string, data: any) {
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    const t = await this.prisma.task.update({ where: { id }, data });
    return this.toResponse(t);
  }

  async delete(id: string) {
    await this.prisma.task.delete({ where: { id } });
    return { success: true, message: 'Task deleted' };
  }

  async assign(id: string, assigneeId: string) {
    const t = await this.prisma.task.update({ where: { id }, data: { assigneeId } });
    return this.toResponse(t);
  }

  async complete(id: string) {
    const t = await this.prisma.task.update({
      where: { id },
      data: { status: 'Completed', completedAt: new Date() },
    });
    return this.toResponse(t);
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    const items = await this.prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { tasks: items.map((t) => this.toResponse(t)) };
  }

  private toResponse(t: any) {
    return {
      id: t.id, companyId: t.companyId, title: t.title, description: t.description,
      priority: t.priority, dueDate: t.dueDate?.toISOString() || '',
      status: t.status, assigneeId: t.assigneeId, assigneeName: t.assigneeName,
      category: t.category, createdBy: t.createdBy,
      createdAt: t.createdAt?.toISOString() || '',
      completedAt: t.completedAt?.toISOString() || '',
    };
  }
}
