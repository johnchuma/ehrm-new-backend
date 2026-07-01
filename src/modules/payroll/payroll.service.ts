import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const ACTIVE_ATTENDANCE_STATUSES = new Set([
  'PRESENT',
  'LATE',
  'WORKED_ON_LEAVE',
  'APPROVED_OVERTIME',
  'PENDING_OVERTIME',
]);

const DEFAULT_PAYROLL_SETTINGS = {
  sdlRatePercent: 4.5,
  wcfRatePercent: 0.5,
  payrollCutoffDay: '25',
  currency: 'TZS',
  overtimeRate: 0,
  sdlExempt: false,
};

function parseJson(value: any, fallback: any = null) {
  if (!value) return fallback;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

function toDateOnly(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function monthStartEnd(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

function monthLabel(month: number, year: number) {
  return `${new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' })} ${year}`;
}

function toMoney(value: any) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

function buildPayrollReference(run: { month: number; year: number }) {
  return `PR-${run.year}-${String(run.month).padStart(2, '0')}`;
}

function calculateTanzaniaDeductions(basic: number, gross: number, settings: any) {
  let paye = 0;
  if (gross > 3_840_000) paye = (gross - 3_840_000) * 0.3 + 540_000;
  else if (gross > 1_440_000) paye = (gross - 1_440_000) * 0.25 + 240_000;
  else if (gross > 720_000) paye = (gross - 720_000) * 0.2 + 96_000;
  else if (gross > 270_000) paye = (gross - 270_000) * 0.12;

  const nssf = basic * 0.1;
  const nhifEmployee = gross * 0.03;
  const nhifEmployer = gross * 0.03;
  const sdl = settings?.sdlExempt ? 0 : gross * (Number(settings?.sdlRatePercent ?? DEFAULT_PAYROLL_SETTINGS.sdlRatePercent) / 100);
  const wcf = gross * (Number(settings?.wcfRatePercent ?? DEFAULT_PAYROLL_SETTINGS.wcfRatePercent) / 100);

  return {
    paye: toMoney(paye),
    nssf: toMoney(nssf),
    nhifEmployee: toMoney(nhifEmployee),
    nhifEmployer: toMoney(nhifEmployer),
    sdl: toMoney(sdl),
    wcf: toMoney(wcf),
  };
}

function combineNames(employee: any) {
  return (
    employee?.fullName ||
    [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') ||
    employee?.employeeNumber ||
    employee?.id ||
    'Employee'
  );
}

function getDepartmentName(employee: any) {
  return employee?.department?.name || 'Unassigned';
}

function getTitleName(employee: any) {
  return employee?.jobTitle?.name || employee?.role || '—';
}

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) {
      throw new NotFoundException('Employee profile not linked to this user');
    }
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  private async getCompanyIdForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (!user?.companyId) {
      throw new NotFoundException('Company not linked to this user');
    }
    return user.companyId;
  }

  private async getPayrollSettings(companyId: string) {
    const companySettings = await this.prisma.companySettings.findUnique({
      where: { companyId },
      select: { companyId: true, payrollCycle: true, overtimeRate: true, generalSettings: true },
    });

    const generalSettings = parseJson(companySettings?.generalSettings, {}) || {};
    return {
      ...DEFAULT_PAYROLL_SETTINGS,
      ...generalSettings,
      payrollCycle: companySettings?.payrollCycle || 'MONTHLY',
      overtimeRate: Number(companySettings?.overtimeRate ?? generalSettings?.overtimeRate ?? DEFAULT_PAYROLL_SETTINGS.overtimeRate) || 0,
    };
  }

  private async getPayrollApprovalConfig(companyId: string) {
    return this.prisma.workspaceApprovalConfig.findFirst({
      where: { companyId, moduleKey: 'PAYROLL', isActive: true },
    });
  }

  private async loadPayrollSourceData(companyId: string, month: number, year: number) {
    const { start, end } = monthStartEnd(month, year);
    const [employees, attendance, offboardings, advances, adjustments, components, settings, approvalConfig] = await Promise.all([
      this.prisma.employee.findMany({
        where: {
          companyId,
          status: { notIn: ['Inactive', 'Terminated'] },
        },
        include: {
          department: { select: { name: true } },
          branch: { select: { name: true } },
          jobTitle: { select: { name: true } },
        },
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.attendance.findMany({
        where: { companyId, date: { gte: start, lte: end } },
        select: { employeeId: true, status: true, overtime: true, approvedBy: true, workMinutes: true, date: true },
      }),
      this.prisma.offboarding.findMany({
        where: { companyId },
        select: { employeeId: true, exitDate: true, settlementJson: true, reason: true, type: true, status: true },
      }),
      this.prisma.salaryAdvance.findMany({
        where: {
          companyId,
          status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
        },
        include: { installments: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payrollAdjustment.findMany({
        where: { companyId, ...(month ? { month } : {}), ...(year ? { year } : {}) },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.payrollComponent.findMany({
        where: { companyId, isActive: true },
        orderBy: { name: 'asc' },
      }),
      this.getPayrollSettings(companyId),
      this.getPayrollApprovalConfig(companyId),
    ]);

    return { employees, attendance, offboardings, advances, adjustments, components, settings, approvalConfig };
  }

  private buildAdvanceInstallments(amount: number, repaymentMonths: number, startMonth: number, startYear: number) {
    const monthlyBase = Math.floor(amount / repaymentMonths);
    let remainder = amount - monthlyBase * repaymentMonths;
    const installments: Array<{ month: number; year: number; amount: number }> = [];
    let month = startMonth;
    let year = startYear;
    for (let index = 0; index < repaymentMonths; index += 1) {
      const installmentAmount = index === repaymentMonths - 1 ? monthlyBase + remainder : monthlyBase;
      installments.push({ month, year, amount: installmentAmount });
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    return installments;
  }

  private async buildPayrollPreview(companyId: string, month: number, year: number) {
    const source = await this.loadPayrollSourceData(companyId, month, year);
    const { employees, attendance, offboardings, advances, adjustments, components, settings, approvalConfig } = source;

    const attendanceMap = new Map<string, number>();
    attendance.forEach((row) => {
      const employeeId = row.employeeId;
      const status = String(row.status || '').toUpperCase();
      if (!employeeId || !ACTIVE_ATTENDANCE_STATUSES.has(status)) return;
      attendanceMap.set(employeeId, (attendanceMap.get(employeeId) || 0) + 1);
    });
    const overtimeRatePerHour = Number(settings?.overtimeRate || 0);
    const authorizedOvertimeMap = new Map<string, number>();
    attendance.forEach((row) => {
      const employeeId = row.employeeId;
      const approvedBy = String(row.approvedBy || '').trim();
      if (!employeeId || !Number(row.overtime || 0)) return;
      if (!approvedBy || approvedBy.toUpperCase().startsWith('UNAUTHORIZED:')) return;
      const amount = Math.round((Number(row.overtime || 0) / 60) * overtimeRatePerHour);
      authorizedOvertimeMap.set(employeeId, (authorizedOvertimeMap.get(employeeId) || 0) + amount);
    });

    const offboardingByEmployee = new Map<string, any>();
    offboardings.forEach((row) => {
      if (!row.employeeId || !row.exitDate?.startsWith(`${year}-${String(month).padStart(2, '0')}`)) return;
      const settlement = parseJson(row.settlementJson, {}) || {};
      const amount =
        toMoney(settlement?.leaveAmount) +
        toMoney(settlement?.noticePayAmount) +
        toMoney(settlement?.severanceAmount) +
        toMoney(settlement?.otherAmount) -
        toMoney(settlement?.loanRecovery) -
        toMoney(settlement?.assetDeductions);
      const existing = offboardingByEmployee.get(row.employeeId);
      if (!existing || amount > existing.amount) {
        offboardingByEmployee.set(row.employeeId, { amount, exitDate: row.exitDate, reason: row.reason, type: row.type });
      }
    });

    const salaryAdvanceMap = new Map<string, number>();
    advances.forEach((advance) => {
      const installment = advance.installments.find((item) => item.month === month && item.year === year && item.status !== 'PAID');
      let amount = installment ? toMoney(installment.amount) : 0;
      if (!amount && advance.repaymentMonths > 0) {
        amount = Math.floor(toMoney(advance.amount) / advance.repaymentMonths);
      }
      if (amount > 0) {
        salaryAdvanceMap.set(advance.employeeId, (salaryAdvanceMap.get(advance.employeeId) || 0) + amount);
      }
    });

    const componentAllowanceMap = new Map<string, number>();
    const componentDeductionMap = new Map<string, number>();
    const addScopedAmount = (map: Map<string, number>, employeeId: string, amount: number) => {
      map.set(employeeId, (map.get(employeeId) || 0) + amount);
    };

    for (const component of components) {
      const targets = employees.filter((employee) => {
        if (component.employeeId && component.employeeId === employee.id) return true;
        if (!component.employeeId && component.departmentId && component.departmentId === employee.departmentId) return true;
        if (!component.employeeId && !component.departmentId && component.positionId && component.positionId === employee.jobTitleId) return true;
        if (!component.employeeId && !component.departmentId && !component.positionId) return true;
        return false;
      });

      const resolvedAmountFor = (employee: any) => {
        const base = toMoney(employee.basicSalary || employee.gross || 0);
        if (component.percentage !== null && component.percentage !== undefined) {
          return Math.round(base * (Number(component.percentage) / 100));
        }
        return toMoney(component.amountTzs || 0);
      };

      for (const employee of targets) {
        const amount = resolvedAmountFor(employee);
        if (!amount) continue;
        if (String(component.type || '').toUpperCase() === 'DEDUCTION') {
          addScopedAmount(componentDeductionMap, employee.id, amount);
        } else {
          addScopedAmount(componentAllowanceMap, employee.id, amount);
        }
      }
    }

    const adjustmentAllowanceMap = new Map<string, number>();
    const adjustmentDeductionMap = new Map<string, number>();
    adjustments.forEach((adjustment) => {
      const employeeId = adjustment.employeeId;
      if (!employeeId) return;
      const amount = Math.abs(toMoney(adjustment.amountTzs));
      const type = String(adjustment.type || '').toUpperCase();
      if (type === 'DEDUCTION') {
        adjustmentDeductionMap.set(employeeId, (adjustmentDeductionMap.get(employeeId) || 0) + amount);
      } else {
        adjustmentAllowanceMap.set(employeeId, (adjustmentAllowanceMap.get(employeeId) || 0) + amount);
      }
    });

    const rows = employees.map((employee) => {
      const basicSalary = toMoney(employee.basicSalary || employee.gross || 0);
      const attendanceDays = attendanceMap.get(employee.id) || 0;
      const componentAllowances = componentAllowanceMap.get(employee.id) || 0;
      const componentDeductions = componentDeductionMap.get(employee.id) || 0;
      const adjustmentAllowances = adjustmentAllowanceMap.get(employee.id) || 0;
      const adjustmentDeductions = adjustmentDeductionMap.get(employee.id) || 0;
      const overtime = authorizedOvertimeMap.get(employee.id) || 0;
      const terminationAmount = offboardingByEmployee.get(employee.id)?.amount || 0;
      const salaryAdvance = salaryAdvanceMap.get(employee.id) || 0;
      const allowances = componentAllowances + adjustmentAllowances;
      const grossSalary = basicSalary + allowances + overtime + terminationAmount;
      const deductionBase = grossSalary;
      const statutory = calculateTanzaniaDeductions(basicSalary, deductionBase, settings);
      const otherDeduction = componentDeductions + adjustmentDeductions + salaryAdvance;
      const totalDeductions =
        statutory.paye +
        statutory.nssf +
        statutory.nhifEmployee +
        statutory.sdl +
        statutory.wcf +
        otherDeduction;
      const netSalary = Math.max(0, grossSalary - totalDeductions);
      const totalPayrollCost = grossSalary + statutory.nssf + statutory.nhifEmployer + statutory.sdl + statutory.wcf;

      return {
        employee,
        basicSalary,
        attendanceDays,
        componentAllowances,
        adjustmentAllowances,
        allowances,
        overtime,
        terminationAmount,
        paye: statutory.paye,
        nssf: statutory.nssf,
        nhifEmployee: statutory.nhifEmployee,
        nhifEmployer: statutory.nhifEmployer,
        sdl: statutory.sdl,
        wcf: statutory.wcf,
        salaryAdvance,
        componentDeductions,
        adjustmentDeductions,
        otherDeduction,
        totalDeductions,
        grossSalary,
        netSalary,
        totalPayrollCost,
      };
    });

    const summary = rows.reduce(
      (acc, row) => {
        acc.employeeCount += 1;
        acc.totalGrossSalary += row.grossSalary;
        acc.totalNetSalary += row.netSalary;
        acc.totalPaye += row.paye;
        acc.totalNssf += row.nssf;
        acc.totalNhifEmployee += row.nhifEmployee;
        acc.totalNhifEmployer += row.nhifEmployer;
        acc.totalSdl += row.sdl;
        acc.totalWcf += row.wcf;
        acc.totalAllowances += row.allowances;
        acc.totalDeductions += row.totalDeductions;
        acc.totalPayrollCost += row.totalPayrollCost;
        return acc;
      },
      {
        employeeCount: 0,
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalPaye: 0,
        totalNssf: 0,
        totalSdl: 0,
        totalWcf: 0,
        totalNhifEmployee: 0,
        totalNhifEmployer: 0,
        totalAllowances: 0,
        totalDeductions: 0,
        totalPayrollCost: 0,
      },
    );

    return {
      month,
      year,
      periodLabel: monthLabel(month, year),
      settings,
      approvalConfig,
      rows,
      summary,
    };
  }

  private serializeRun(run: any) {
    return {
      ...run,
      totalGrossSalary: Number(run.totalGrossSalary || 0),
      totalNetSalary: Number(run.totalNetSalary || 0),
      totalPaye: Number(run.totalPaye || 0),
      totalNssf: Number(run.totalNssf || 0),
      totalSdl: Number(run.totalSdl || 0),
      totalWcf: Number(run.totalWcf || 0),
      totalNhifEmployee: Number(run.totalNhifEmployee || 0),
      totalNhifEmployer: Number(run.totalNhifEmployer || 0),
      totalAllowances: Number(run.totalAllowances || 0),
      totalDeductions: Number(run.totalDeductions || 0),
      totalPayrollCost: Number(run.totalPayrollCost || 0),
    };
  }

  private serializeItem(item: any) {
    return {
      ...item,
      basicSalary: Number(item.basicSalary || 0),
      allowances: Number(item.allowances || 0),
      overtime: Number(item.overtime || 0),
      terminationAmount: Number(item.terminationAmount || 0),
      grossSalary: Number(item.grossSalary || 0),
      paye: Number(item.paye || 0),
      nssf: Number(item.nssf || 0),
      sdl: Number(item.sdl || 0),
      wcf: Number(item.wcf || 0),
      nhifEmployee: Number(item.nhifEmployee || 0),
      nhifEmployer: Number(item.nhifEmployer || 0),
      salaryAdvance: Number(item.salaryAdvance || 0),
      otherDeduction: Number(item.otherDeduction || 0),
      totalDeductions: Number(item.totalDeductions || 0),
      netSalary: Number(item.netSalary || 0),
      totalPayrollCost: Number(item.totalPayrollCost || 0),
    };
  }

  private buildCsv(run: any, items: any[]) {
    const rows = [
      [
        'Employee',
        'Employee No',
        'Department',
        'Title',
        'Basic',
        'Allowances',
        'Overtime',
        'Termination',
        'Attendance Days',
        'Gross',
        'PAYE',
        'NSSF',
        'NHIF Employee',
        'SDL',
        'WCF',
        'Salary Advance',
        'Other Deduction',
        'Net',
        'CTC',
      ],
    ];

    for (const item of items) {
      rows.push([
        item.employeeName,
        item.employeeNumber || '',
        item.departmentName || '',
        item.title || '',
        String(Number(item.basicSalary || 0)),
        String(Number(item.allowances || 0)),
        String(Number(item.overtime || 0)),
        String(Number(item.terminationAmount || 0)),
        String(item.attendanceDays || 0),
        String(Number(item.grossSalary || 0)),
        String(Number(item.paye || 0)),
        String(Number(item.nssf || 0)),
        String(Number(item.nhifEmployee || 0)),
        String(Number(item.sdl || 0)),
        String(Number(item.wcf || 0)),
        String(Number(item.salaryAdvance || 0)),
        String(Number(item.otherDeduction || 0)),
        String(Number(item.netSalary || 0)),
        String(Number(item.totalPayrollCost || 0)),
      ]);
    }

    return rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
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
      breakdown: payslip.breakdown ? parseJson(payslip.breakdown, null) : null,
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
    if (dto.repaymentMonths < 1 || dto.repaymentMonths > 12) {
      throw new BadRequestException('Repayment months must be between 1 and 12');
    }

    const active = await this.prisma.salaryAdvance.findFirst({
      where: { employeeId, status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] } },
    });
    if (active) throw new BadRequestException('You already have an active or pending salary advance');

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { basicSalary: true },
    });
    const maxAdvance = Number(employee?.basicSalary ?? 0) * 2;
    if (dto.amount > maxAdvance) {
      throw new BadRequestException(`Advance cannot exceed 2x basic salary (TZS ${maxAdvance.toLocaleString()})`);
    }

    const created = await this.prisma.salaryAdvance.create({
      data: {
        employeeId,
        companyId,
        amount: dto.amount,
        reason: dto.reason,
        repaymentMonths: dto.repaymentMonths,
        status: 'PENDING',
      },
    });

    const installments = this.buildAdvanceInstallments(
      toMoney(dto.amount),
      dto.repaymentMonths,
      new Date().getMonth() + 1,
      new Date().getFullYear(),
    );
    if (installments.length) {
      await this.prisma.salaryAdvanceInstallment.createMany({
        data: installments.map((installment) => ({
          advanceId: created.id,
          month: installment.month,
          year: installment.year,
          amount: installment.amount,
          status: 'PENDING',
        })),
      });
    }

    return this.prisma.salaryAdvance.findUnique({
      where: { id: created.id },
      include: { installments: { orderBy: [{ year: 'asc' }, { month: 'asc' }] } },
    });
  }

  async listSalaryAdvances(companyId: string, filters: { employeeId?: string; status?: string; page?: number; limit?: number } = {}) {
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Math.min(200, Number(filters.limit || 50)));
    const where: any = { companyId };
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status && filters.status !== 'All') where.status = filters.status;

    const [total, rows] = await Promise.all([
      this.prisma.salaryAdvance.count({ where }),
      this.prisma.salaryAdvance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              fullName: true,
              firstName: true,
              lastName: true,
              department: { select: { name: true } },
            },
          },
          installments: { orderBy: [{ year: 'asc' }, { month: 'asc' }] },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: rows.map((row) => ({
        ...row,
        employeeName: combineNames(row.employee),
        departmentName: getDepartmentName(row.employee),
        amount: Number(row.amount || 0),
        installments: row.installments.map((installment) => ({
          ...installment,
          amount: Number(installment.amount || 0),
        })),
      })),
      __pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async createSalaryAdvance(companyId: string, body: RequestAdvanceDto & { employeeId: string }) {
    if (!body.employeeId) throw new BadRequestException('employeeId is required');
    if (!body.amount || body.amount <= 0) throw new BadRequestException('Amount must be positive');
    if (!body.repaymentMonths || body.repaymentMonths < 1 || body.repaymentMonths > 12) {
      throw new BadRequestException('Repayment months must be between 1 and 12');
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: body.employeeId, companyId },
      select: { id: true, basicSalary: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const existing = await this.prisma.salaryAdvance.findFirst({
      where: { employeeId: body.employeeId, status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] } },
    });
    if (existing) throw new BadRequestException('Employee already has an active or pending advance');

    const created = await this.prisma.salaryAdvance.create({
      data: {
        employeeId: body.employeeId,
        companyId,
        amount: body.amount,
        reason: body.reason,
        repaymentMonths: body.repaymentMonths,
        status: 'PENDING',
      },
    });

    const installments = this.buildAdvanceInstallments(
      toMoney(body.amount),
      body.repaymentMonths,
      new Date().getMonth() + 1,
      new Date().getFullYear(),
    );
    await this.prisma.salaryAdvanceInstallment.createMany({
      data: installments.map((installment) => ({
        advanceId: created.id,
        month: installment.month,
        year: installment.year,
        amount: installment.amount,
        status: 'PENDING',
      })),
    });

    return this.prisma.salaryAdvance.findUnique({
      where: { id: created.id },
      include: { installments: { orderBy: [{ year: 'asc' }, { month: 'asc' }] } },
    });
  }

  async updateSalaryAdvance(companyId: string, id: string, body: Partial<RequestAdvanceDto> & { status?: string; reason?: string }) {
    const advance = await this.prisma.salaryAdvance.findFirst({ where: { id, companyId } });
    if (!advance) throw new NotFoundException('Salary advance not found');
    const updated = await this.prisma.salaryAdvance.update({
      where: { id },
      data: {
        ...(body.amount !== undefined ? { amount: body.amount } : {}),
        ...(body.reason !== undefined ? { reason: body.reason } : {}),
        ...(body.repaymentMonths !== undefined ? { repaymentMonths: body.repaymentMonths } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
      include: { installments: { orderBy: [{ year: 'asc' }, { month: 'asc' }] } },
    });
    return {
      ...updated,
      amount: Number(updated.amount || 0),
      installments: updated.installments.map((installment) => ({
        ...installment,
        amount: Number(installment.amount || 0),
      })),
    };
  }

  async deleteSalaryAdvance(companyId: string, id: string) {
    const advance = await this.prisma.salaryAdvance.findFirst({ where: { id, companyId } });
    if (!advance) throw new NotFoundException('Salary advance not found');
    await this.prisma.salaryAdvance.delete({ where: { id } });
    return { ok: true };
  }

  // ── Payroll Admin ──

  async listPayrollRuns(companyId: string, filters: { month?: number; year?: number; page?: number; limit?: number } = {}) {
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Math.min(100, Number(filters.limit || 20)));
    const where: any = { companyId };
    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;

    const [total, rows] = await Promise.all([
      this.prisma.payrollRun.count({ where }),
      this.prisma.payrollRun.findMany({
        where,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { items: { select: { id: true } } },
      }),
    ]);

    return {
      data: rows.map((row) => ({
        ...this.serializeRun(row),
        employeeCount: row.employeeCount,
        itemCount: row.items.length,
      })),
      __pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async getPayrollRun(companyId: string, runId: string) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, companyId },
      include: { items: { orderBy: { employeeName: 'asc' } } },
    });
    if (!run) throw new NotFoundException('Payroll run not found');
    return {
      ...this.serializeRun(run),
      items: run.items.map((item) => this.serializeItem(item)),
    };
  }

  async getRunPayslips(companyId: string, runId: string) {
    const run = await this.getPayrollRun(companyId, runId);
    return run.items;
  }

  async getPayrollSummary(companyId: string, month: number, year: number) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { companyId_month_year: { companyId, month, year } },
      include: { items: { orderBy: { employeeName: 'asc' } } },
    });

    if (!run) {
      return this.buildPayrollPreview(companyId, month, year);
    }

    const items = run.items.map((item) => this.serializeItem(item));
    return {
      run: this.serializeRun(run),
      items,
      summary: {
        employeeCount: run.employeeCount,
        totalGrossSalary: Number(run.totalGrossSalary || 0),
        totalNetSalary: Number(run.totalNetSalary || 0),
        totalPaye: Number(run.totalPaye || 0),
        totalNssf: Number(run.totalNssf || 0),
        totalNhifEmployee: Number(run.totalNhifEmployee || 0),
        totalNhifEmployer: Number(run.totalNhifEmployer || 0),
        totalSdl: Number(run.totalSdl || 0),
        totalWcf: Number(run.totalWcf || 0),
        totalAllowances: Number(run.totalAllowances || 0),
        totalDeductions: Number(run.totalDeductions || 0),
        totalPayrollCost: Number(run.totalPayrollCost || 0),
      },
    };
  }

  async getPaylist(companyId: string, month: number, year: number, format: 'json' | 'csv' = 'json') {
    const existingRun = await this.prisma.payrollRun.findUnique({
      where: { companyId_month_year: { companyId, month, year } },
      include: { items: { orderBy: { employeeName: 'asc' } } },
    });
    const preview = existingRun || (await this.buildPayrollPreview(companyId, month, year));

    if ('items' in preview && format === 'json') {
      return {
        run: this.serializeRun(preview),
        items: preview.items.map((item: any) => this.serializeItem(item)),
        summary: {
          employeeCount: preview.employeeCount,
          totalGrossSalary: Number(preview.totalGrossSalary || 0),
          totalNetSalary: Number(preview.totalNetSalary || 0),
          totalPaye: Number(preview.totalPaye || 0),
          totalNssf: Number(preview.totalNssf || 0),
          totalNhifEmployee: Number(preview.totalNhifEmployee || 0),
          totalNhifEmployer: Number(preview.totalNhifEmployer || 0),
          totalSdl: Number(preview.totalSdl || 0),
          totalWcf: Number(preview.totalWcf || 0),
          totalAllowances: Number(preview.totalAllowances || 0),
          totalDeductions: Number(preview.totalDeductions || 0),
          totalPayrollCost: Number(preview.totalPayrollCost || 0),
        },
      };
    }

    const rows = 'items' in preview ? preview.items.map((item: any) => this.serializeItem(item)) : preview.rows;
    const csv = this.buildCsv(preview, rows);
    return { filename: `paylist-${month}-${year}.csv`, csv };
  }

  async generatePayrollRun(companyId: string, body: { month: number; year: number; paymentMethod?: string; payDate?: string; cutoffDay?: number }, actor: any) {
    if (!body?.month || !body?.year) {
      throw new BadRequestException('month and year are required');
    }

    const preview = await this.buildPayrollPreview(companyId, body.month, body.year);
    const existing = await this.prisma.payrollRun.findUnique({
      where: { companyId_month_year: { companyId, month: body.month, year: body.year } },
    });
    if (existing && existing.status === 'CLOSED') {
      throw new BadRequestException('Payroll run is already closed for this period');
    }

    const approvalRequired = !!preview.approvalConfig;
    const nextStatus = approvalRequired ? 'PENDING_APPROVAL' : 'APPROVED';
    const payDate = toDateOnly(body.payDate);

    const run = await this.prisma.$transaction(async (tx) => {
      const runRecord = existing
        ? await tx.payrollRun.update({
            where: { id: existing.id },
            data: {
              periodLabel: preview.periodLabel,
              paymentMethod: body.paymentMethod || 'Bank Transfer',
              payDate,
              cutoffDay: body.cutoffDay ?? Number(preview.settings?.payrollCutoffDay || DEFAULT_PAYROLL_SETTINGS.payrollCutoffDay),
              status: nextStatus,
              employeeCount: preview.summary.employeeCount,
              totalGrossSalary: preview.summary.totalGrossSalary,
              totalNetSalary: preview.summary.totalNetSalary,
              totalPaye: preview.summary.totalPaye,
              totalNssf: preview.summary.totalNssf,
              totalSdl: preview.summary.totalSdl,
              totalWcf: preview.summary.totalWcf,
              totalNhifEmployee: preview.summary.totalNhifEmployee,
              totalNhifEmployer: preview.summary.totalNhifEmployer,
              totalAllowances: preview.summary.totalAllowances,
              totalDeductions: preview.summary.totalDeductions,
              totalPayrollCost: preview.summary.totalPayrollCost,
              approvalConfigKey: preview.approvalConfig?.moduleKey || null,
              submittedAt: new Date(),
              approvedAt: nextStatus === 'APPROVED' ? new Date() : null,
              approvedBy: nextStatus === 'APPROVED' ? (actor?.fullName || actor?.name || null) : null,
              closedAt: null,
              metadata: JSON.stringify({ month: body.month, year: body.year, source: 'generatePayrollRun' }),
            },
          })
        : await tx.payrollRun.create({
            data: {
              companyId,
              month: body.month,
              year: body.year,
              periodLabel: preview.periodLabel,
              paymentMethod: body.paymentMethod || 'Bank Transfer',
              payDate,
              cutoffDay: body.cutoffDay ?? Number(preview.settings?.payrollCutoffDay || DEFAULT_PAYROLL_SETTINGS.payrollCutoffDay),
              status: nextStatus,
              employeeCount: preview.summary.employeeCount,
              totalGrossSalary: preview.summary.totalGrossSalary,
              totalNetSalary: preview.summary.totalNetSalary,
              totalPaye: preview.summary.totalPaye,
              totalNssf: preview.summary.totalNssf,
              totalSdl: preview.summary.totalSdl,
              totalWcf: preview.summary.totalWcf,
              totalNhifEmployee: preview.summary.totalNhifEmployee,
              totalNhifEmployer: preview.summary.totalNhifEmployer,
              totalAllowances: preview.summary.totalAllowances,
              totalDeductions: preview.summary.totalDeductions,
              totalPayrollCost: preview.summary.totalPayrollCost,
              approvalConfigKey: preview.approvalConfig?.moduleKey || null,
              submittedAt: new Date(),
              approvedAt: nextStatus === 'APPROVED' ? new Date() : null,
              approvedBy: nextStatus === 'APPROVED' ? (actor?.fullName || actor?.name || null) : null,
              metadata: JSON.stringify({ month: body.month, year: body.year, source: 'generatePayrollRun' }),
            },
          });

      await tx.payrollRunItem.deleteMany({ where: { payrollRunId: runRecord.id } });
      await tx.payrollRunItem.createMany({
        data: preview.rows.map((row: any) => ({
          payrollRunId: runRecord.id,
          companyId,
          employeeId: row.employee.id,
          employeeNumber: row.employee.employeeNumber || null,
          employeeName: combineNames(row.employee),
          departmentName: getDepartmentName(row.employee),
          title: getTitleName(row.employee),
          basicSalary: row.basicSalary,
          allowances: row.allowances,
          overtime: row.overtime,
          terminationAmount: row.terminationAmount,
          attendanceDays: row.attendanceDays,
          grossSalary: row.grossSalary,
          paye: row.paye,
          nssf: row.nssf,
          sdl: row.sdl,
          wcf: row.wcf,
          nhifEmployee: row.nhifEmployee,
          nhifEmployer: row.nhifEmployer,
          salaryAdvance: row.salaryAdvance,
          otherDeduction: row.otherDeduction,
          totalDeductions: row.totalDeductions,
          netSalary: row.netSalary,
          totalPayrollCost: row.totalPayrollCost,
          reviewStatus: nextStatus,
          remarks: null,
          metadata: JSON.stringify({ month: body.month, year: body.year }),
        })),
      });

      for (const row of preview.rows) {
        const breakdown = {
          earnings: [
            { label: 'Basic Salary', amount: row.basicSalary },
            { label: 'Allowances', amount: row.allowances },
            { label: 'Overtime', amount: row.overtime },
            { label: 'Termination', amount: row.terminationAmount },
          ],
          deductions: [
            { label: 'PAYE', amount: row.paye },
            { label: 'NSSF', amount: row.nssf },
            { label: 'NHIF Employee', amount: row.nhifEmployee },
            { label: 'SDL', amount: row.sdl },
            { label: 'WCF', amount: row.wcf },
            { label: 'Salary Advance', amount: row.salaryAdvance },
            { label: 'Other Deduction', amount: row.otherDeduction },
          ],
        };

        await tx.payslip.upsert({
          where: {
            employeeId_month_year: {
              employeeId: row.employee.id,
              month: body.month,
              year: body.year,
            },
          },
          create: {
            employeeId: row.employee.id,
            companyId,
            month: body.month,
            year: body.year,
            basicSalary: row.basicSalary,
            grossSalary: row.grossSalary,
            totalAllowances: row.allowances,
            totalDeductions: row.totalDeductions,
            paye: row.paye,
            nssf: row.nssf,
            wcf: row.wcf,
            sdl: row.sdl,
            netSalary: row.netSalary,
            breakdown: JSON.stringify(breakdown),
            status: nextStatus === 'APPROVED' ? 'APPROVED' : 'DRAFT',
          },
          update: {
            companyId,
            basicSalary: row.basicSalary,
            grossSalary: row.grossSalary,
            totalAllowances: row.allowances,
            totalDeductions: row.totalDeductions,
            paye: row.paye,
            nssf: row.nssf,
            wcf: row.wcf,
            sdl: row.sdl,
            netSalary: row.netSalary,
            breakdown: JSON.stringify(breakdown),
            status: nextStatus === 'APPROVED' ? 'APPROVED' : 'DRAFT',
          },
        });
      }

      if (approvalRequired) {
        await tx.task.create({
          data: {
            companyId,
            title: `Approve payroll run ${preview.periodLabel}`,
            description: `Payroll run ${preview.periodLabel} generated and waiting approval.`,
            priority: 'HIGH',
            status: 'TODO',
            module: 'PAYROLL',
            referenceId: runRecord.id,
            dueDate: payDate || new Date(body.year, body.month - 1, 28),
          },
        });
      }

      return runRecord;
    });

    return this.getPayrollRun(companyId, run.id);
  }

  async approvePayrollRun(companyId: string, runId: string, actor: any) {
    const run = await this.prisma.payrollRun.findFirst({ where: { id: runId, companyId } });
    if (!run) throw new NotFoundException('Payroll run not found');

    const updated = await this.prisma.payrollRun.update({
      where: { id: runId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: actor?.fullName || actor?.name || null,
      },
    });

    await this.prisma.payrollRunItem.updateMany({
      where: { payrollRunId: runId },
      data: { reviewStatus: 'APPROVED' },
    });

    await this.prisma.payslip.updateMany({
      where: { companyId, month: run.month, year: run.year },
      data: { status: 'APPROVED' },
    });

    return this.getPayrollRun(companyId, updated.id);
  }

  async closePayrollRun(companyId: string, runId: string) {
    const run = await this.prisma.payrollRun.findFirst({ where: { id: runId, companyId } });
    if (!run) throw new NotFoundException('Payroll run not found');

    const updated = await this.prisma.payrollRun.update({
      where: { id: runId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    await this.prisma.payrollRunItem.updateMany({
      where: { payrollRunId: runId },
      data: { reviewStatus: 'CLOSED' },
    });

    await this.prisma.payslip.updateMany({
      where: { companyId, month: run.month, year: run.year },
      data: { status: 'PAID', paidAt: new Date() },
    });

    return this.getPayrollRun(companyId, updated.id);
  }

  async listPayrollAdjustments(companyId: string, filters: { employeeId?: string; type?: string; code?: string; month?: number; year?: number; page?: number; limit?: number } = {}) {
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Math.min(200, Number(filters.limit || 50)));
    const where: any = { companyId };
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.type) where.type = filters.type;
    if (filters.code) where.code = filters.code;
    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;

    const [total, rows] = await Promise.all([
      this.prisma.payrollAdjustment.count({ where }),
      this.prisma.payrollAdjustment.findMany({
        where,
        include: {
          employee: { select: { id: true, employeeNumber: true, fullName: true, firstName: true, lastName: true, department: { select: { name: true } } } },
          payrollRun: { select: { id: true, month: true, year: true, periodLabel: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: rows.map((row) => ({
        ...row,
        amountTzs: Number(row.amountTzs || 0),
        employeeName: row.employee ? combineNames(row.employee) : '',
        departmentName: row.employee ? getDepartmentName(row.employee) : '',
      })),
      __pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async createPayrollAdjustment(companyId: string, body: any) {
    const employeeId = body.employeeId || null;
    if (employeeId) {
      const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, companyId }, select: { id: true } });
      if (!employee) throw new NotFoundException('Employee not found');
    }

    const created = await this.prisma.payrollAdjustment.create({
      data: {
        companyId,
        employeeId,
        payrollRunId: body.payrollRunId || null,
        type: String(body.type || 'DEDUCTION').toUpperCase(),
        code: String(body.code || 'OTHER_DEDUCTION').toUpperCase(),
        description: body.description || null,
        amountTzs: Math.abs(toMoney(body.amountTzs ?? body.amount ?? 0)),
        month: body.month ? Number(body.month) : null,
        year: body.year ? Number(body.year) : null,
        status: body.status || 'ACTIVE',
        remarks: body.remarks || body.notes || null,
        referenceId: body.referenceId || null,
      },
      include: {
        employee: { select: { id: true, employeeNumber: true, fullName: true, firstName: true, lastName: true, department: { select: { name: true } } } },
      },
    });

    return {
      ...created,
      amountTzs: Number(created.amountTzs || 0),
      employeeName: created.employee ? combineNames(created.employee) : '',
      departmentName: created.employee ? getDepartmentName(created.employee) : '',
    };
  }

  async updatePayrollAdjustment(companyId: string, id: string, body: any) {
    const adjustment = await this.prisma.payrollAdjustment.findFirst({ where: { id, companyId } });
    if (!adjustment) throw new NotFoundException('Payroll adjustment not found');

    const updated = await this.prisma.payrollAdjustment.update({
      where: { id },
      data: {
        ...(body.employeeId !== undefined ? { employeeId: body.employeeId || null } : {}),
        ...(body.payrollRunId !== undefined ? { payrollRunId: body.payrollRunId || null } : {}),
        ...(body.type !== undefined ? { type: String(body.type).toUpperCase() } : {}),
        ...(body.code !== undefined ? { code: String(body.code).toUpperCase() } : {}),
        ...(body.description !== undefined ? { description: body.description || null } : {}),
        ...(body.amountTzs !== undefined || body.amount !== undefined ? { amountTzs: Math.abs(toMoney(body.amountTzs ?? body.amount)) } : {}),
        ...(body.month !== undefined ? { month: body.month ? Number(body.month) : null } : {}),
        ...(body.year !== undefined ? { year: body.year ? Number(body.year) : null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.remarks !== undefined || body.notes !== undefined ? { remarks: body.remarks ?? body.notes ?? null } : {}),
        ...(body.referenceId !== undefined ? { referenceId: body.referenceId || null } : {}),
      },
      include: { employee: { select: { id: true, employeeNumber: true, fullName: true, firstName: true, lastName: true, department: { select: { name: true } } } } },
    });

    return {
      ...updated,
      amountTzs: Number(updated.amountTzs || 0),
      employeeName: updated.employee ? combineNames(updated.employee) : '',
      departmentName: updated.employee ? getDepartmentName(updated.employee) : '',
    };
  }

  async deletePayrollAdjustment(companyId: string, id: string) {
    const adjustment = await this.prisma.payrollAdjustment.findFirst({ where: { id, companyId } });
    if (!adjustment) throw new NotFoundException('Payroll adjustment not found');
    await this.prisma.payrollAdjustment.delete({ where: { id } });
    return { ok: true };
  }

  async listPayrollComponents(companyId: string) {
    const rows = await this.prisma.payrollComponent.findMany({
      where: { companyId },
      include: {
        employee: { select: { id: true, employeeNumber: true, fullName: true, firstName: true, lastName: true } },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return {
      data: rows.map((row) => ({
        ...row,
        amountTzs: Number(row.amountTzs || 0),
        percentage: row.percentage !== null && row.percentage !== undefined ? Number(row.percentage) : null,
        employeeName: row.employee ? combineNames(row.employee) : '',
      })),
    };
  }

  async upsertPayrollComponent(companyId: string, body: any) {
    if (!body.code) throw new BadRequestException('code is required');
    if (!body.name) throw new BadRequestException('name is required');
    if (!body.type) throw new BadRequestException('type is required');

    const payload = {
      companyId,
      employeeId: body.employeeId || null,
      departmentId: body.departmentId || null,
      positionId: body.positionId || null,
      name: body.name,
      code: String(body.code).toUpperCase(),
      type: String(body.type).toUpperCase(),
      amountTzs: body.amountTzs !== undefined && body.amountTzs !== null && body.amountTzs !== '' ? Math.abs(toMoney(body.amountTzs)) : null,
      percentage: body.percentage !== undefined && body.percentage !== null && body.percentage !== '' ? Number(body.percentage) : null,
      scope: body.scope || 'COMPANY',
      notes: body.notes || null,
      isActive: body.isActive !== undefined ? !!body.isActive : true,
    };

    const existing = await this.prisma.payrollComponent.findUnique({
      where: { companyId_code: { companyId, code: payload.code } },
    });

    const saved = existing
      ? await this.prisma.payrollComponent.update({ where: { id: existing.id }, data: payload })
      : await this.prisma.payrollComponent.create({ data: payload });

    return {
      ...saved,
      amountTzs: saved.amountTzs !== null ? Number(saved.amountTzs) : null,
      percentage: saved.percentage !== null ? Number(saved.percentage) : null,
    };
  }

  async deletePayrollComponent(companyId: string, id: string) {
    const component = await this.prisma.payrollComponent.findFirst({ where: { id, companyId } });
    if (!component) throw new NotFoundException('Payroll component not found');
    await this.prisma.payrollComponent.delete({ where: { id } });
    return { ok: true };
  }

  async getEmployeeSalaryHistory(companyId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, companyId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const [payslips, advances, adjustments, runItems] = await Promise.all([
      this.prisma.payslip.findMany({ where: { employeeId }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
      this.prisma.salaryAdvance.findMany({ where: { employeeId }, include: { installments: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.payrollAdjustment.findMany({ where: { companyId, employeeId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.payrollRunItem.findMany({
        where: { companyId, employeeId },
        include: { payrollRun: { select: { id: true, month: true, year: true, periodLabel: true, status: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      employee: {
        id: employee.id,
        fullName: combineNames(employee),
        employeeNumber: employee.employeeNumber || '',
        departmentName: getDepartmentName(employee),
        title: getTitleName(employee),
      },
      payslips: payslips.map((payslip) => ({
        ...payslip,
        basicSalary: Number(payslip.basicSalary || 0),
        grossSalary: Number(payslip.grossSalary || 0),
        netSalary: Number(payslip.netSalary || 0),
        totalDeductions: Number(payslip.totalDeductions || 0),
        totalAllowances: Number(payslip.totalAllowances || 0),
      })),
      advances: advances.map((advance) => ({
        ...advance,
        amount: Number(advance.amount || 0),
        installments: advance.installments.map((installment) => ({
          ...installment,
          amount: Number(installment.amount || 0),
        })),
      })),
      adjustments: adjustments.map((adjustment) => ({
        ...adjustment,
        amountTzs: Number(adjustment.amountTzs || 0),
      })),
      runItems: runItems.map((item) => ({
        ...item,
        grossSalary: Number(item.grossSalary || 0),
        netSalary: Number(item.netSalary || 0),
        totalPayrollCost: Number(item.totalPayrollCost || 0),
        payrollRun: item.payrollRun,
      })),
    };
  }
}

export interface RequestAdvanceDto {
  amount: number;
  repaymentMonths: number;
  reason?: string;
}
