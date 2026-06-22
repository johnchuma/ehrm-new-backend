import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class LeaveBalanceService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async getBalance(employeeId: string, leaveTypeId: string) {
    const balance = await this.prisma.leaveBalance.findFirst({
      where: { employeeId, leaveTypeId },
      include: { leaveType: true },
    });
    if (!balance) {
      const type = await this.prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
      if (!type) throw GrpcErrors.NOT_FOUND('Leave type not found');
      return {
        id: '', employeeId, leaveTypeId,
        leaveTypeName: type.name,
        opening: 0, accrued: type.entitlementDays,
        used: 0, available: type.entitlementDays, year: String(new Date().getFullYear()),
      };
    }
    return this.toResponse(balance);
  }

  async listBalances(companyId: string, employeeId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    const balances = await this.prisma.leaveBalance.findMany({
      where,
      include: { leaveType: true },
    });
    return { balances: balances.map((b) => this.toResponse(b)) };
  }

  async accrue(data: { employeeId: string; leaveTypeId: string; days: number; year: string }) {
    const year = data.year || String(new Date().getFullYear());
    const balance = await this.prisma.leaveBalance.upsert({
      where: { employeeId_leaveTypeId_year: { employeeId: data.employeeId, leaveTypeId: data.leaveTypeId, year } },
      update: { accrued: { increment: data.days }, available: { increment: data.days } },
      create: {
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        year,
        accrued: data.days,
        available: data.days,
      },
      include: { leaveType: true },
    });
    return this.toResponse(balance);
  }

  async getLiability(companyId: string) {
    const balances = await this.prisma.leaveBalance.findMany({
      include: { leaveType: true },
    });
    const employees = new Map<string, number>();
    let totalLiability = 0;
    let totalEncashmentExposure = 0;
    const byDept = new Map<string, { headcount: number; totalDays: number; liability: number; encashmentExposure: number }>();

    balances.forEach((b) => {
      const key = b.employeeId;
      const val = b.available * 50000;
      totalLiability += val;
      totalEncashmentExposure += val * 0.5;
      const cur = employees.get(key) || 0;
      employees.set(key, cur + 1);
    });

    const items = Array.from(employees.entries()).map(([empId, count]) => {
      const empBalances = balances.filter((b) => b.employeeId === empId);
      const totalDays = empBalances.reduce((s, b) => s + b.available, 0);
      const liability = totalDays * 50000;
      return {
        department: `Employee ${empId.slice(-4)}`,
        headcount: count,
        totalDays,
        liability,
        encashmentExposure: liability * 0.5,
      };
    });

    return {
      items,
      totalLiability,
      totalEncashmentExposure,
    };
  }

  private toResponse(b: any) {
    return {
      id: b.id, employeeId: b.employeeId, leaveTypeId: b.leaveTypeId,
      leaveTypeName: b.leaveType?.name || '',
      opening: b.opening, accrued: b.accrued, used: b.used, available: b.available,
      year: b.year,
    };
  }
}
