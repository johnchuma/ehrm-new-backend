import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class ReviewService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const r = await this.prisma.review.create({ data });
    return this.toResponse(r);
  }

  async get(id: string) {
    const r = await this.prisma.review.findUnique({ where: { id } });
    if (!r) throw GrpcErrors.NOT_FOUND('Review not found');
    return this.toResponse(r);
  }

  async update(id: string, data: any) {
    const r = await this.prisma.review.update({ where: { id }, data });
    return this.toResponse(r);
  }

  async submit(id: string) {
    const r = await this.prisma.review.update({
      where: { id },
      data: { status: 'Submitted', submittedAt: new Date() },
    });
    return this.toResponse(r);
  }

  async list(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    const reviews = await this.prisma.review.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { reviews: reviews.map((r) => this.toResponse(r)) };
  }

  private toResponse(r: any) {
    return {
      id: r.id, companyId: r.companyId, employeeId: r.employeeId,
      employeeName: r.employeeName, reviewerId: r.reviewerId, reviewerName: r.reviewerName,
      period: r.period, type: r.type, rating: r.rating,
      strengths: r.strengths, improvements: r.improvements, comments: r.comments,
      status: r.status, createdAt: r.createdAt?.toISOString() || '',
      submittedAt: r.submittedAt?.toISOString() || '',
    };
  }
}
