import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class EnrollmentService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async enroll(data: { programId: string; employeeId: string }) {
    const program = await this.prisma.trainingProgram.findUnique({ where: { id: data.programId } });
    const enrollment = await this.prisma.trainingEnrollment.create({
      data: { ...data, programTitle: program?.title },
    });
    await this.prisma.trainingProgram.update({
      where: { id: data.programId },
      data: { enrolled: { increment: 1 } },
    });
    return this.toResponse(enrollment);
  }

  async update(id: string, data: any) {
    const enrollment = await this.prisma.trainingEnrollment.update({
      where: { id },
      data: { ...data, completedAt: data.status === 'Completed' ? new Date() : undefined },
    });
    return this.toResponse(enrollment);
  }

  async list(programId?: string, employeeId?: string) {
    const where: any = {};
    if (programId) where.programId = programId;
    if (employeeId) where.employeeId = employeeId;
    const items = await this.prisma.trainingEnrollment.findMany({ where, orderBy: { enrolledAt: 'desc' } });
    return { enrollments: items.map((e) => this.toResponse(e)) };
  }

  private toResponse(e: any) {
    return {
      id: e.id, programId: e.programId, programTitle: e.programTitle,
      employeeId: e.employeeId, employeeName: e.employeeName,
      status: e.status, score: e.score, feedback: e.feedback,
      enrolledAt: e.enrolledAt?.toISOString() || '',
      completedAt: e.completedAt?.toISOString() || '',
    };
  }
}
