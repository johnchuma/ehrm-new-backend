import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  // ── Reviews ──

  async getMyReviews(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.performanceReview.findMany({
      where: { employeeId },
      include: { goals: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReviewById(userId: string, reviewId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const review = await this.prisma.performanceReview.findFirst({
      where: { id: reviewId, employeeId },
      include: { goals: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async submitSelfReview(userId: string, reviewId: string, dto: SelfReviewDto) {
    const { employeeId } = await this.resolveEmployee(userId);
    const review = await this.prisma.performanceReview.findFirst({
      where: { id: reviewId, employeeId, status: { in: ['PENDING', 'SELF_REVIEW'] } },
    });
    if (!review) throw new NotFoundException('Review not open for self-review');
    if (dto.rating < 1 || dto.rating > 5) throw new BadRequestException('Rating must be 1-5');
    return this.prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        selfRating: dto.rating,
        selfComment: dto.comment,
        status: 'MANAGER_REVIEW',
      },
    });
  }

  // ── Goals ──

  async getMyGoals(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.performanceGoal.findMany({
      where: { employeeId },
      orderBy: { targetDate: 'asc' },
    });
  }

  async createGoal(userId: string, dto: CreateGoalDto) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    return this.prisma.performanceGoal.create({
      data: {
        employeeId,
        companyId,
        title: dto.title,
        description: dto.description,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
        weight: dto.weight ?? 100,
        reviewId: dto.reviewId,
      },
    });
  }

  async updateGoalProgress(userId: string, goalId: string, progress: number, status?: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const goal = await this.prisma.performanceGoal.findFirst({
      where: { id: goalId, employeeId },
    });
    if (!goal) throw new NotFoundException('Goal not found');
    return this.prisma.performanceGoal.update({
      where: { id: goalId },
      data: {
        progress: Math.min(100, Math.max(0, progress)),
        ...(status ? { status } : {}),
      },
    });
  }

  // ── Manager: team reviews ──

  async getTeamReviews(userId: string, status?: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const directReports = await this.prisma.employee.findMany({
      where: { managerId: employeeId },
      select: { id: true },
    });
    const reportIds = directReports.map((r) => r.id);
    return this.prisma.performanceReview.findMany({
      where: {
        employeeId: { in: reportIds },
        ...(status ? { status } : {}),
      },
      include: {
        employee: { select: { user: { select: { fullName: true } }, employeeNumber: true } },
        goals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitManagerReview(userId: string, reviewId: string, dto: ManagerReviewDto) {
    const { employeeId } = await this.resolveEmployee(userId);
    const review = await this.prisma.performanceReview.findFirst({
      where: { id: reviewId, reviewerId: employeeId, status: 'MANAGER_REVIEW' },
    });
    if (!review) throw new NotFoundException('Review not found or not in manager review stage');
    return this.prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        managerRating: dto.rating,
        managerComment: dto.comment,
        overallRating: Math.round((review.selfRating ?? dto.rating + dto.rating) / 2),
        strengths: dto.strengths,
        improvements: dto.improvements,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  // Admin: create review cycle
  async createReview(companyId: string, employeeId: string, dto: any) {
    return this.prisma.performanceReview.create({
      data: {
        employeeId,
        companyId,
        period: dto.period,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reviewerId: dto.reviewerId,
        status: 'PENDING',
      },
    });
  }
}

export interface SelfReviewDto { rating: number; comment?: string; }
export interface ManagerReviewDto { rating: number; comment?: string; strengths?: string; improvements?: string; }
export interface CreateGoalDto { title: string; description?: string; targetDate?: string; weight?: number; reviewId?: string; }
