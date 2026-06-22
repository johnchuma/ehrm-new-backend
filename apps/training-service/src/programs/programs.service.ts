import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class ProgramService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const p = await this.prisma.trainingProgram.create({
      data: { ...data, startDate: new Date(data.startDate), endDate: new Date(data.endDate) },
    });
    return this.toResponse(p);
  }

  async get(id: string) {
    const p = await this.prisma.trainingProgram.findUnique({ where: { id } });
    if (!p) throw GrpcErrors.NOT_FOUND('Program not found');
    return this.toResponse(p);
  }

  async update(id: string, data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    const p = await this.prisma.trainingProgram.update({ where: { id }, data });
    return this.toResponse(p);
  }

  async delete(id: string) {
    await this.prisma.trainingProgram.delete({ where: { id } });
    return { success: true, message: 'Program deleted' };
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    const programs = await this.prisma.trainingProgram.findMany({ where, orderBy: { startDate: 'desc' } });
    return { programs: programs.map((p) => this.toResponse(p)) };
  }

  private toResponse(p: any) {
    return {
      id: p.id, companyId: p.companyId, title: p.title, description: p.description,
      category: p.category, trainer: p.trainer,
      startDate: p.startDate?.toISOString() || '',
      endDate: p.endDate?.toISOString() || '',
      location: p.location, maxParticipants: p.maxParticipants,
      enrolled: p.enrolled, status: p.status,
      createdAt: p.createdAt?.toISOString() || '',
    };
  }
}
