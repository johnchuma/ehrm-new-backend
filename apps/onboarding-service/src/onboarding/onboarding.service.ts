import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class OnboardingService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const o = await this.prisma.onboarding.create({
      data: { ...data, startDate: new Date(data.startDate) },
    });
    return this.toResponse(o);
  }

  async get(id: string) {
    const o = await this.prisma.onboarding.findUnique({ where: { id } });
    if (!o) throw GrpcErrors.NOT_FOUND('Onboarding not found');
    return this.toResponse(o);
  }

  async update(id: string, data: any) {
    const o = await this.prisma.onboarding.update({ where: { id }, data });
    return this.toResponse(o);
  }

  async advanceStage(id: string, stage: string) {
    const o = await this.prisma.onboarding.update({ where: { id }, data: { currentStage: stage } });
    return this.toResponse(o);
  }

  async complete(id: string) {
    const o = await this.prisma.onboarding.update({
      where: { id },
      data: { status: 'Completed', completedAt: new Date() },
    });
    return this.toResponse(o);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const items = await this.prisma.onboarding.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { onboardings: items.map((o) => this.toResponse(o)) };
  }

  private toResponse(o: any) {
    return {
      id: o.id, companyId: o.companyId, employeeId: o.employeeId,
      employeeName: o.employeeName, startDate: o.startDate?.toISOString() || '',
      buddy: o.buddy, departmentId: o.departmentId, position: o.position,
      currentStage: o.currentStage, status: o.status,
      createdAt: o.createdAt?.toISOString() || '',
      completedAt: o.completedAt?.toISOString() || '',
    };
  }
}
