import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class EnrollmentService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async enroll(data: any) {
    const benefit = await this.prisma.benefit.findUnique({ where: { id: data.benefitId } });
    const enrollment = await this.prisma.benefitEnrollment.create({
      data: { ...data, benefitName: benefit?.name, effectiveDate: new Date(data.effectiveDate) },
    });
    return this.toResponse(enrollment);
  }

  async list(companyId?: string, employeeId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    const items = await this.prisma.benefitEnrollment.findMany({ where, orderBy: { enrolledAt: 'desc' } });
    return { enrollments: items.map((e) => this.toResponse(e)) };
  }

  private toResponse(e: any) {
    return {
      id: e.id, benefitId: e.benefitId, benefitName: e.benefitName,
      employeeId: e.employeeId, employeeName: e.employeeName,
      effectiveDate: e.effectiveDate?.toISOString() || '',
      status: e.status, enrolledAt: e.enrolledAt?.toISOString() || '',
    };
  }
}
