import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class CertificationService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async issue(data: any) {
    const program = await this.prisma.trainingProgram.findUnique({ where: { id: data.programId } });
    const cert = await this.prisma.certification.create({
      data: {
        ...data,
        programTitle: program?.title,
        issuedDate: new Date(data.issuedDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
    return this.toResponse(cert);
  }

  async list(employeeId?: string, companyId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    const certs = await this.prisma.certification.findMany({ where, orderBy: { issuedDate: 'desc' } });
    return { certifications: certs.map((c) => this.toResponse(c)) };
  }

  private toResponse(c: any) {
    return {
      id: c.id, employeeId: c.employeeId, employeeName: c.employeeName,
      programId: c.programId, programTitle: c.programTitle,
      certificateNumber: c.certificateNumber,
      issuedDate: c.issuedDate?.toISOString() || '',
      expiryDate: c.expiryDate?.toISOString() || '',
    };
  }
}
