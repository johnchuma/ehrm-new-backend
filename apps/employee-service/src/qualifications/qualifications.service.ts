import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class QualificationService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async addEducation(data: any) {
    const edu = await this.prisma.education.create({ data });
    return {
      id: edu.id, employeeId: edu.employeeId, institution: edu.institution,
      qualification: edu.qualification, award: edu.award, year: edu.year,
    };
  }

  async addProfessionalQualification(data: any) {
    const qual = await this.prisma.qualification.create({
      data: { ...data, expiry: data.expiry ? new Date(data.expiry) : null },
    });
    return {
      id: qual.id, employeeId: qual.employeeId, name: qual.name,
      authority: qual.authority, licenseNumber: qual.licenseNumber,
      expiry: qual.expiry?.toISOString() || '',
    };
  }

  async listEducation(employeeId: string) {
    const edus = await this.prisma.education.findMany({ where: { employeeId } });
    return { education: edus.map((e) => ({ id: e.id, employeeId: e.employeeId, institution: e.institution, qualification: e.qualification, award: e.award, year: e.year })) };
  }

  async listQualifications(employeeId: string) {
    const quals = await this.prisma.qualification.findMany({ where: { employeeId } });
    return { qualifications: quals.map((q) => ({ id: q.id, employeeId: q.employeeId, name: q.name, authority: q.authority, licenseNumber: q.licenseNumber, expiry: q.expiry?.toISOString() || '' })) };
  }
}
