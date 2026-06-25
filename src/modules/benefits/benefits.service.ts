import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BenefitsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  async getCompanyBenefits(userId: string) {
    const { companyId, employeeId } = await this.resolveEmployee(userId);
    const benefits = await this.prisma.benefit.findMany({
      where: { companyId, isActive: true },
      include: {
        enrollments: {
          where: { employeeId, status: 'ACTIVE' },
          select: { id: true, status: true, startDate: true },
        },
      },
    });
    return benefits.map((b) => ({ ...b, enrolled: b.enrollments.length > 0, enrollments: undefined }));
  }

  async getMyBenefits(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.benefitEnrollment.findMany({
      where: { employeeId, status: 'ACTIVE' },
      include: {
        benefit: true,
        claims: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async getMyClaims(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.benefitClaim.findMany({
      where: { employeeId },
      include: {
        enrollment: { include: { benefit: { select: { name: true, type: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitClaim(userId: string, dto: SubmitClaimDto) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    const enrollment = await this.prisma.benefitEnrollment.findFirst({
      where: { id: dto.enrollmentId, employeeId, status: 'ACTIVE' },
      include: { benefit: true },
    });
    if (!enrollment) throw new NotFoundException('Active benefit enrollment not found');

    if (enrollment.benefit.maxAmount) {
      const totalClaimed = await this.prisma.benefitClaim.aggregate({
        where: {
          enrollmentId: enrollment.id,
          status: { in: ['PENDING', 'APPROVED', 'PAID'] },
        },
        _sum: { amount: true },
      });
      const used = Number(totalClaimed._sum.amount ?? 0);
      const max = Number(enrollment.benefit.maxAmount);
      if (used + dto.amount > max)
        throw new BadRequestException(`Claim exceeds benefit limit. Remaining: TZS ${(max - used).toLocaleString()}`);
    }

    return this.prisma.benefitClaim.create({
      data: {
        enrollmentId: enrollment.id,
        employeeId,
        companyId,
        amount: dto.amount,
        description: dto.description,
        documents: dto.documents ? JSON.stringify(dto.documents) : null,
        status: 'PENDING',
      },
    });
  }

  // Admin endpoints
  async createBenefit(companyId: string, dto: any) {
    return this.prisma.benefit.create({ data: { ...dto, companyId } });
  }

  async enrollEmployee(companyId: string, employeeId: string, benefitId: string) {
    return this.prisma.benefitEnrollment.upsert({
      where: { employeeId_benefitId: { employeeId, benefitId } },
      create: { employeeId, companyId, benefitId, startDate: new Date(), status: 'ACTIVE' },
      update: { status: 'ACTIVE' },
    });
  }

  async getAllClaims(companyId: string, status?: string) {
    return this.prisma.benefitClaim.findMany({
      where: { companyId, ...(status ? { status } : {}) },
      include: {
        enrollment: { include: { benefit: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processClaim(claimId: string, action: 'APPROVED' | 'REJECTED', approvedBy: string, reason?: string) {
    return this.prisma.benefitClaim.update({
      where: { id: claimId },
      data: {
        status: action,
        approvedBy,
        approvedAt: new Date(),
        rejectionReason: action === 'REJECTED' ? reason : null,
      },
    });
  }
}

export interface SubmitClaimDto {
  enrollmentId: string;
  amount: number;
  description: string;
  documents?: string[];
}
