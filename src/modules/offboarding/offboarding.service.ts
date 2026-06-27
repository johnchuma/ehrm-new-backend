import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';

const PENDING_APPROVAL_STATUS = 'Pending Approval';

async function hasApprovalFlow(companyId: string, prisma: PrismaService) {
  const cfg = await prisma.workspaceApprovalConfig.findFirst({
    where: { companyId, moduleKey: 'OFFBOARDING', isActive: true },
    select: { id: true },
  });
  return !!cfg;
}

function safeJson(value: string | null | undefined) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function toDateOnlyStr(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function daysBetween(target: string | null | undefined, ref: Date = new Date()) {
  if (!target) return null;
  const end = new Date(target);
  if (Number.isNaN(end.getTime())) return null;
  const today = new Date(ref.toISOString().slice(0, 10));
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

@Injectable()
export class OffboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  private include() {
    return {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          email: true,
          employeeNumber: true,
          stage: true,
          status: true,
          department: { select: { id: true, name: true } },
          jobTitle: { select: { id: true, name: true } },
        },
      },
      contract: {
        select: {
          id: true,
          contractNumber: true,
          status: true,
          endDate: true,
          contractType: { select: { id: true, name: true, code: true } },
        },
      },
    } as const;
  }

  private serialize(row: any) {
    const clearances = safeJson(row.clearancesJson);
    const assets = safeJson(row.assetsJson);
    const settlement = safeJson(row.settlementJson);
    const clearedCount = clearances && typeof clearances === 'object'
      ? Object.values(clearances).filter((value) => value === 'Approved').length
      : 0;
    const totalClearances = clearances && typeof clearances === 'object' ? Object.keys(clearances).length : 0;
    return {
      ...row,
      settlement,
      interview: safeJson(row.interviewJson),
      knowledgeTransfer: safeJson(row.knowledgeTransferJson),
      handover: safeJson(row.handoverJson),
      clearances,
      assets,
      daysToExit: daysBetween(row.exitDate),
      clearanceSummary: totalClearances ? `${clearedCount}/${totalClearances}` : '0/0',
      assetsRecoveredCount: Array.isArray(assets?.recovered) ? assets.recovered.length : 0,
      settlementTotal: settlement && typeof settlement === 'object'
        ? Number(settlement.leaveAmount || 0)
          + Number(settlement.noticePayAmount || 0)
          + Number(settlement.severanceAmount || 0)
          + Number(settlement.otherAmount || 0)
          - Number(settlement.loanRecovery || 0)
          - Number(settlement.assetDeductions || 0)
        : 0,
    };
  }

  async list(filters: { companyId?: string; employeeId?: string; status?: string; search?: string }) {
    const where: any = {};
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { reason: { contains: filters.search } },
        { employee: { firstName: { contains: filters.search } } },
        { employee: { lastName: { contains: filters.search } } },
        { employee: { email: { contains: filters.search } } },
        { employee: { employeeNumber: { contains: filters.search } } },
      ];
    }

    const rows = await this.prisma.offboarding.findMany({
      where,
      include: this.include(),
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.serialize(row));
  }

  async getOne(id: string) {
    const row = await this.prisma.offboarding.findUnique({
      where: { id },
      include: this.include(),
    });
    if (!row) throw new NotFoundException('Offboarding case not found');
    return this.serialize(row);
  }

  async historyForEmployee(employeeId: string) {
    const rows = await this.prisma.offboarding.findMany({
      where: { employeeId },
      include: this.include(),
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.serialize(row));
  }

  async stats(companyId: string) {
    const rows = await this.prisma.offboarding.findMany({
      where: { companyId },
      select: { id: true, status: true, exitDate: true, approvalStage: true, completedAt: true },
    });
    const pendingApproval = rows.filter((row) => row.status === PENDING_APPROVAL_STATUS).length;
    const inProgress = rows.filter((row) => row.status === 'In Progress').length;
    const completed = rows.filter((row) => row.status === 'Completed').length;
    const pendingClearance = rows.filter((row) => row.status !== 'Completed').length;
    const dueThisMonth = rows.filter((row) => {
      const remaining = daysBetween(row.exitDate);
      return remaining !== null && remaining >= 0 && remaining <= 30;
    }).length;
    return { total: rows.length, pendingApproval, inProgress, completed, pendingClearance, dueThisMonth };
  }

  async create(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.employeeId) throw new BadRequestException('employeeId required');
    if (!body.exitDate) throw new BadRequestException('exitDate required');
    if (!body.reason) throw new BadRequestException('reason required');

    const approvalRequired = await hasApprovalFlow(body.companyId, this.prisma);
    const status = approvalRequired ? PENDING_APPROVAL_STATUS : 'In Progress';

    const created = await this.prisma.offboarding.create({
      data: {
        companyId: body.companyId,
        employeeId: body.employeeId,
        contractId: body.contractId || null,
        reason: body.reason,
        type: body.type || 'With Payment',
        exitDate: toDateOnlyStr(body.exitDate) || body.exitDate,
        terminationGround: body.terminationGround || null,
        noticePeriodDays: body.noticePeriodDays !== undefined && body.noticePeriodDays !== null ? Number(body.noticePeriodDays) : null,
        noticeDate: toDateOnlyStr(body.noticeDate),
        retirementDate: toDateOnlyStr(body.retirementDate),
        retirementBenefits: body.retirementBenefits || null,
        redundancyReason: body.redundancyReason || null,
        redundancyConsultationDate: toDateOnlyStr(body.redundancyConsultationDate),
        settlementJson: body.settlement ? JSON.stringify(body.settlement) : null,
        interviewJson: body.interview ? JSON.stringify(body.interview) : null,
        knowledgeTransferJson: body.knowledgeTransfer ? JSON.stringify(body.knowledgeTransfer) : null,
        handoverJson: body.handover ? JSON.stringify(body.handover) : null,
        clearancesJson: body.clearances ? JSON.stringify(body.clearances) : null,
        assetsJson: body.assets ? JSON.stringify(body.assets) : null,
        systemAccessRevoked: !!body.systemAccessRevoked,
        idCardCollected: !!body.idCardCollected,
        approvalStage: approvalRequired ? 0 : 1,
        status,
        approvedAt: status === 'In Progress' ? new Date() : null,
        approvedBy: status === 'In Progress' ? body.approvedBy || null : null,
      },
      include: this.include(),
    });

    if (!approvalRequired) {
      await this.markEmployeeOffboarding(body.employeeId, body.exitDate);
    }

    return this.serialize(created);
  }

  async update(id: string, body: any) {
    const existing = await this.prisma.offboarding.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Offboarding case not found');

    const data: any = {};
    const passthrough = ['reason', 'type', 'terminationGround', 'retirementBenefits', 'redundancyReason'];
    for (const key of passthrough) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.exitDate !== undefined) data.exitDate = toDateOnlyStr(body.exitDate) || body.exitDate;
    if (body.noticePeriodDays !== undefined) data.noticePeriodDays = body.noticePeriodDays === '' || body.noticePeriodDays === null ? null : Number(body.noticePeriodDays);
    if (body.noticeDate !== undefined) data.noticeDate = toDateOnlyStr(body.noticeDate);
    if (body.retirementDate !== undefined) data.retirementDate = toDateOnlyStr(body.retirementDate);
    if (body.redundancyConsultationDate !== undefined) data.redundancyConsultationDate = toDateOnlyStr(body.redundancyConsultationDate);
    if (body.settlement !== undefined) data.settlementJson = body.settlement ? JSON.stringify(body.settlement) : null;
    if (body.interview !== undefined) data.interviewJson = body.interview ? JSON.stringify(body.interview) : null;
    if (body.knowledgeTransfer !== undefined) data.knowledgeTransferJson = body.knowledgeTransfer ? JSON.stringify(body.knowledgeTransfer) : null;
    if (body.handover !== undefined) data.handoverJson = body.handover ? JSON.stringify(body.handover) : null;
    if (body.clearances !== undefined) data.clearancesJson = body.clearances ? JSON.stringify(body.clearances) : null;
    if (body.assets !== undefined) data.assetsJson = body.assets ? JSON.stringify(body.assets) : null;
    if (body.systemAccessRevoked !== undefined) data.systemAccessRevoked = !!body.systemAccessRevoked;
    if (body.idCardCollected !== undefined) data.idCardCollected = !!body.idCardCollected;

    const updated = await this.prisma.offboarding.update({
      where: { id },
      data,
      include: this.include(),
    });
    return this.serialize(updated);
  }

  async approve(id: string, body: { approvedBy?: string }) {
    const existing = await this.prisma.offboarding.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Offboarding case not found');

    const updated = await this.prisma.offboarding.update({
      where: { id },
      data: {
        status: 'In Progress',
        approvalStage: Math.max(existing.approvalStage, 1),
        approvedAt: new Date(),
        approvedBy: body.approvedBy || null,
      },
      include: this.include(),
    });

    await this.markEmployeeOffboarding(existing.employeeId, existing.exitDate);
    return this.serialize(updated);
  }

  async complete(id: string, body: { completedBy?: string; notes?: string }) {
    const existing = await this.prisma.offboarding.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Offboarding case not found');

    const updated = await this.prisma.offboarding.update({
      where: { id },
      data: {
        status: 'Completed',
        completedAt: new Date(),
        completedBy: body.completedBy || null,
      },
      include: this.include(),
    });

    await this.prisma.employee.update({
      where: { id: existing.employeeId },
      data: { status: 'Inactive', endDate: existing.exitDate },
    }).catch(() => {});

    const emp = await this.prisma.employee.findUnique({ where: { id: existing.employeeId }, include: { user: true } });
    if (emp?.user?.id) {
      await this.notifications.send(emp.user.id, {
        type: 'OFFBOARDING_COMPLETED',
        title: 'Offboarding completed',
        message: `Your offboarding process has been completed.`,
        link: '/dashboard/offboarding',
        companyId: existing.companyId,
      }).catch(() => {});
    }

    return this.serialize(updated);
  }

  private async markEmployeeOffboarding(employeeId: string, exitDate: string) {
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        stage: 'Offboarding',
        status: 'Inactive',
        endDate: exitDate,
      },
    }).catch(() => {});
  }
}
