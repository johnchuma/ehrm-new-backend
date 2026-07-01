import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface NonPayrollCostDto {
  companyId?: string;
  category?: string;
  title?: string;
  item?: string;
  amount?: number | string;
  costDate?: string;
  date?: string;
  description?: string;
}

@Injectable()
export class CtcService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveCompanyId(user: any, requestedCompanyId?: string) {
    const activeCompanyId = user?.companyId || user?.selectedCompanyId;
    if (user?.isSuperAdmin && requestedCompanyId) return requestedCompanyId;
    if (!activeCompanyId) throw new BadRequestException('Active company is required');
    if (requestedCompanyId && requestedCompanyId !== activeCompanyId) {
      throw new ForbiddenException('You can only manage costs for the active company');
    }
    return activeCompanyId;
  }

  private normalizePayload(dto: NonPayrollCostDto) {
    const title = (dto.title || dto.item || '').trim();
    const amount = Number(dto.amount || 0);
    const costDate = dto.costDate || dto.date;

    if (!title) throw new BadRequestException('Cost title is required');
    if (!amount || amount <= 0) throw new BadRequestException('Cost amount must be greater than zero');
    if (!costDate) throw new BadRequestException('Cost date is required');

    return {
      category: dto.category || 'Other',
      title,
      amount,
      costDate: new Date(costDate),
      description: dto.description || null,
    };
  }

  async listNonPayrollCosts(user: any, filters: { companyId?: string; month?: string; year?: string; category?: string }) {
    const companyId = this.resolveCompanyId(user, filters.companyId);
    const month = Number(filters.month || 0);
    const year = Number(filters.year || 0);
    const where: any = {
      companyId,
      ...(filters.category ? { category: filters.category } : {}),
    };

    if (month >= 1 && month <= 12 && year > 0) {
      where.costDate = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    } else if (year > 0) {
      where.costDate = {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      };
    }

    return this.prisma.nonPayrollCost.findMany({
      where,
      orderBy: [{ costDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createNonPayrollCost(user: any, dto: NonPayrollCostDto) {
    const companyId = this.resolveCompanyId(user, dto.companyId);
    return this.prisma.nonPayrollCost.create({
      data: {
        companyId,
        ...this.normalizePayload(dto),
        createdBy: user?.sub || null,
      },
    });
  }

  async updateNonPayrollCost(user: any, id: string, dto: NonPayrollCostDto) {
    const companyId = this.resolveCompanyId(user, dto.companyId);
    const existing = await this.prisma.nonPayrollCost.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Non-payroll cost not found');

    return this.prisma.nonPayrollCost.update({
      where: { id },
      data: this.normalizePayload(dto),
    });
  }

  async deleteNonPayrollCost(user: any, id: string, companyId?: string) {
    const activeCompanyId = this.resolveCompanyId(user, companyId);
    const existing = await this.prisma.nonPayrollCost.findFirst({ where: { id, companyId: activeCompanyId } });
    if (!existing) throw new NotFoundException('Non-payroll cost not found');

    await this.prisma.nonPayrollCost.delete({ where: { id } });
    return { deleted: true, id };
  }
}