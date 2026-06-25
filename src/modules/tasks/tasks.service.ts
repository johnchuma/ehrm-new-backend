import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyTasks(userId: string, status?: string) {
    return this.prisma.task.findMany({
      where: {
        assigneeId: userId,
        ...(status ? { status } : {}),
      },
      include: {
        createdBy: { select: { fullName: true, id: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async updateTaskStatus(userId: string, taskId: string, status: string, notes?: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, assigneeId: userId },
    });
    if (!task) throw new NotFoundException('Task not found or not assigned to you');
    const VALID = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (!VALID.includes(status)) throw new ForbiddenException('Invalid status');
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }

  async createTask(data: {
    companyId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    createdById?: string;
    dueDate?: string;
    priority?: string;
    module?: string;
    referenceId?: string;
  }) {
    return this.prisma.task.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        createdById: data.createdById,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        priority: data.priority ?? 'MEDIUM',
        module: data.module,
        referenceId: data.referenceId,
      },
    });
  }

  async getCompanyTasks(companyId: string, assigneeId?: string, status?: string) {
    return this.prisma.task.findMany({
      where: {
        companyId,
        ...(assigneeId ? { assigneeId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        assignee: { select: { fullName: true, id: true } },
        createdBy: { select: { fullName: true, id: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
  }
}
