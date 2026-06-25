import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked to this user');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  // ── Payslips ──

  async getMyPayslips(userId: string, year?: number) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.payslip.findMany({
      where: { employeeId, ...(year ? { year } : {}) },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: {
        id: true,
        month: true,
        year: true,
        basicSalary: true,
        grossSalary: true,
        netSalary: true,
        totalDeductions: true,
        totalAllowances: true,
        status: true,
        paidAt: true,
      },
    });
  }

  async getPayslipById(userId: string, payslipId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const payslip = await this.prisma.payslip.findFirst({
      where: { id: payslipId, employeeId },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');
    return {
      ...payslip,
      breakdown: payslip.breakdown ? JSON.parse(payslip.breakdown) : null,
    };
  }

  // ── Salary Advances ──

  async getMyAdvances(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.salaryAdvance.findMany({
      where: { employeeId },
      include: { installments: { orderBy: [{ year: 'asc' }, { month: 'asc' }] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async requestAdvance(userId: string, dto: RequestAdvanceDto) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);

    if (dto.amount <= 0) throw new BadRequestException('Amount must be positive');
    if (dto.repaymentMonths < 1 || dto.repaymentMonths > 12)
      throw new BadRequestException('Repayment months must be between 1 and 12');

    // Block if active advance exists
    const active = await this.prisma.salaryAdvance.findFirst({
      where: { employeeId, status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] } },
    });
    if (active) throw new BadRequestException('You already have an active or pending salary advance');

    // Validate against salary
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { basicSalary: true },
    });
    const maxAdvance = Number(employee?.basicSalary ?? 0) * 2;
    if (dto.amount > maxAdvance)
      throw new BadRequestException(`Advance cannot exceed 2x basic salary (TZS ${maxAdvance.toLocaleString()})`);

    return this.prisma.salaryAdvance.create({
      data: {
        employeeId,
        companyId,
        amount: dto.amount,
        reason: dto.reason,
        repaymentMonths: dto.repaymentMonths,
        status: 'PENDING',
      },
    });
  }

  // ── Payroll Run (company admin) ──

  async generatePayslip(
    companyId: string,
    employeeId: string,
    month: number,
    year: number,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const existing = await this.prisma.payslip.findFirst({
      where: { employeeId, month, year },
    });
    if (existing) throw new BadRequestException('Payslip already generated for this period');

    const basic = Number(employee.basicSalary);
    const { paye, nssf, wcf, sdl } = this.calculateTanzaniaDeductions(basic);
    const totalDeductions = paye + nssf + wcf + sdl;
    const net = basic - totalDeductions;

    return this.prisma.payslip.create({
      data: {
        employeeId,
        companyId,
        month,
        year,
        basicSalary: basic,
        grossSalary: basic,
        totalAllowances: 0,
        totalDeductions,
        paye,
        nssf,
        wcf,
        sdl,
        netSalary: net,
        breakdown: JSON.stringify({
          earnings: [{ label: 'Basic Salary', amount: basic }],
          deductions: [
            { label: 'PAYE', amount: paye },
            { label: 'NSSF (Employee 10%)', amount: nssf },
            { label: 'WCF (0.5%)', amount: wcf },
            { label: 'SDL (4.5%)', amount: sdl },
          ],
        }),
        status: 'DRAFT',
      },
    });
  }

  private calculateTanzaniaDeductions(basic: number) {
    // PAYE Tanzania 2024/25 bands (monthly)
    let paye = 0;
    if (basic > 3_840_000) paye = (basic - 3_840_000) * 0.3 + 540_000;
    else if (basic > 1_440_000) paye = (basic - 1_440_000) * 0.25 + 240_000;
    else if (basic > 720_000) paye = (basic - 720_000) * 0.2 + 96_000;
    else if (basic > 270_000) paye = (basic - 270_000) * 0.12;

    const nssf = basic * 0.1;    // Employee 10%
    const wcf = basic * 0.005;   // WCF 0.5%
    const sdl = basic * 0.045;   // SDL 4.5% (employer, deducted here for display)
    return { paye, nssf, wcf, sdl };
  }
}

export interface RequestAdvanceDto {
  amount: number;
  repaymentMonths: number;
  reason?: string;
}
