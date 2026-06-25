import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  async getMyClaims(userId: string, status?: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.expenseClaim.findMany({
      where: { employeeId, ...(status ? { status } : {}) },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClaimById(userId: string, claimId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const claim = await this.prisma.expenseClaim.findFirst({
      where: { id: claimId, employeeId },
      include: { items: true },
    });
    if (!claim) throw new NotFoundException('Expense claim not found');
    return claim;
  }

  async submitClaim(userId: string, dto: SubmitExpenseDto) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    if (!dto.items || dto.items.length === 0)
      throw new BadRequestException('At least one expense item required');

    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    return this.prisma.expenseClaim.create({
      data: {
        employeeId,
        companyId,
        title: dto.title,
        description: dto.description,
        totalAmount,
        currency: dto.currency ?? 'TZS',
        status: 'PENDING',
        items: {
          create: dto.items.map((item) => ({
            category: item.category ?? 'OTHER',
            description: item.description,
            amount: item.amount,
            date: new Date(item.date),
            receipt: item.receipt,
          })),
        },
      },
      include: { items: true },
    });
  }

  async cancelClaim(userId: string, claimId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const claim = await this.prisma.expenseClaim.findFirst({
      where: { id: claimId, employeeId, status: 'PENDING' },
    });
    if (!claim) throw new NotFoundException('Pending claim not found');
    return this.prisma.expenseClaim.update({
      where: { id: claimId },
      data: { status: 'REJECTED' },
    });
  }

  // Admin/Finance
  async getAllClaims(companyId: string, status?: string) {
    return this.prisma.expenseClaim.findMany({
      where: { companyId, ...(status ? { status } : {}) },
      include: {
        items: true,
        employee: { select: { employeeNumber: true, user: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processClaim(claimId: string, action: 'APPROVED' | 'REJECTED', approvedBy: string, reason?: string) {
    return this.prisma.expenseClaim.update({
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

export interface SubmitExpenseDto {
  title: string;
  description?: string;
  currency?: string;
  items: {
    category?: string;
    description: string;
    amount: number;
    date: string;
    receipt?: string;
  }[];
}
