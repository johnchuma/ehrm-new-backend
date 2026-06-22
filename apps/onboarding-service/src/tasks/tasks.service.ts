import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class OnboardingTaskService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const t = await this.prisma.onboardingTask.create({
      data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null },
    });
    return this.toResponse(t);
  }

  async complete(id: string) {
    const t = await this.prisma.onboardingTask.update({
      where: { id },
      data: { status: 'Completed', completedAt: new Date() },
    });
    return this.toResponse(t);
  }

  async list(onboardingId: string) {
    const tasks = await this.prisma.onboardingTask.findMany({ where: { onboardingId } });
    return { tasks: tasks.map((t) => this.toResponse(t)) };
  }

  private toResponse(t: any) {
    return {
      id: t.id, onboardingId: t.onboardingId, title: t.title,
      description: t.description, assignee: t.assignee,
      dueDate: t.dueDate?.toISOString() || '', status: t.status,
      completedAt: t.completedAt?.toISOString() || '',
    };
  }
}
