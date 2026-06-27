import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';

const ACTIVE_STATUSES = ['Active', 'Probation', 'ExpiringSoon', 'Extended'];
const PENDING_APPROVAL_STATUS = 'Pending Approval';

async function hasApprovalFlow(companyId: string, moduleKey: string, prisma: PrismaService) {
  const cfg = await prisma.workspaceApprovalConfig.findFirst({
    where: { companyId, moduleKey, isActive: true },
    select: { id: true },
  });
  return !!cfg;
}

function toDateOnlyStr(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function daysBetween(target: string | null | undefined, ref: Date = new Date()) {
  if (!target) return null;
  const t = new Date(target);
  if (isNaN(t.getTime())) return null;
  const ms = t.getTime() - new Date(ref.toISOString().slice(0, 10)).getTime();
  return Math.round(ms / 86_400_000);
}

function deriveStatus(contract: {
  status: string;
  endDate: string | null;
  probationEndDate: string | null;
  terminatedAt: Date | null;
}): string {
  if (contract.terminatedAt) return 'Terminated';
  if (
    contract.status === 'Renewed' ||
    contract.status === 'Terminated' ||
    contract.status === 'Draft' ||
    contract.status === PENDING_APPROVAL_STATUS
  ) {
    return contract.status;
  }
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  if (contract.endDate && contract.endDate < todayStr) return 'Expired';
  const dToEnd = daysBetween(contract.endDate);
  if (dToEnd !== null && dToEnd <= 30 && dToEnd >= 0) return 'ExpiringSoon';
  const dToProb = daysBetween(contract.probationEndDate);
  if (dToProb !== null && dToProb >= 0 && dToProb <= 60 && contract.probationEndDate && contract.probationEndDate >= todayStr) {
    // Inside probation window
    return 'Probation';
  }
  return 'Active';
}

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  // ------------- helpers -------------

  private contractInclude() {
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
      contractType: { select: { id: true, name: true, code: true } },
    } as const;
  }

  private serialize(c: any) {
    const derived = deriveStatus(c);
    return {
      ...c,
      // Plain primitives for the frontend.
      salary: c.salary !== null && c.salary !== undefined ? Number(c.salary) : null,
      derivedStatus: derived,
      daysToEnd: daysBetween(c.endDate),
      daysToProbationEnd: daysBetween(c.probationEndDate),
    };
  }

  // ------------- queries -------------

  async list(filters: {
    companyId?: string;
    employeeId?: string;
    status?: string;
    search?: string;
  }) {
    const where: any = {};
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { contractNumber: { contains: filters.search } },
        { employee: { firstName: { contains: filters.search } } },
        { employee: { lastName: { contains: filters.search } } },
        { employee: { email: { contains: filters.search } } },
      ];
    }
    const rows = await this.prisma.contract.findMany({
      where,
      include: this.contractInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.serialize(r));
  }

  async getOne(id: string) {
    const c = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        ...this.contractInclude(),
        parentContract: { select: { id: true, version: true, startDate: true, endDate: true, status: true } },
        childContracts: { select: { id: true, version: true, startDate: true, endDate: true, status: true } },
      },
    });
    if (!c) throw new NotFoundException('Contract not found');
    return this.serialize(c);
  }

  async historyForEmployee(employeeId: string) {
    const rows = await this.prisma.contract.findMany({
      where: { employeeId },
      include: this.contractInclude(),
      orderBy: [{ startDate: 'desc' }, { version: 'desc' }],
    });
    return rows.map((r) => this.serialize(r));
  }

  async stats(companyId: string) {
    const rows = await this.prisma.contract.findMany({
      where: { companyId },
      select: { id: true, status: true, endDate: true, probationEndDate: true, terminatedAt: true },
    });
    const enriched = rows.map((r) => ({ ...r, derivedStatus: deriveStatus(r) }));
    const active = enriched.filter((r) => ACTIVE_STATUSES.includes(r.derivedStatus)).length;
    const pendingApproval = enriched.filter((r) => r.derivedStatus === PENDING_APPROVAL_STATUS).length;
    const expiringSoon = enriched.filter((r) => r.derivedStatus === 'ExpiringSoon').length;
    const expired = enriched.filter((r) => r.derivedStatus === 'Expired').length;
    const probationEnding = enriched.filter((r) => {
      const d = daysBetween(r.probationEndDate);
      return d !== null && d >= 0 && d <= 60;
    }).length;
    const terminated = enriched.filter((r) => r.derivedStatus === 'Terminated').length;
    return { total: rows.length, active, pendingApproval, expiringSoon, expired, probationEnding, terminated };
  }

  async alerts(companyId: string) {
    const all = await this.prisma.contract.findMany({
      where: { companyId, terminatedAt: null },
      include: this.contractInclude(),
    });
    const expiring = all
      .map((c) => ({ ...c, daysToEnd: daysBetween(c.endDate) }))
      .filter((c) => c.daysToEnd !== null && c.daysToEnd >= 0 && c.daysToEnd <= 90)
      .sort((a, b) => (a.daysToEnd ?? 0) - (b.daysToEnd ?? 0))
      .map((c) => this.serialize(c));
    const probation = all
      .map((c) => ({ ...c, daysToProbationEnd: daysBetween(c.probationEndDate) }))
      .filter((c) => c.daysToProbationEnd !== null && c.daysToProbationEnd >= 0 && c.daysToProbationEnd <= 60)
      .sort((a, b) => (a.daysToProbationEnd ?? 0) - (b.daysToProbationEnd ?? 0))
      .map((c) => this.serialize(c));
    return { expiring, probation };
  }

  // ------------- mutations -------------

  async create(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.employeeId) throw new BadRequestException('employeeId required');
    if (!body.startDate) throw new BadRequestException('startDate required');

    // Compute next version for this employee
    const previous = await this.prisma.contract.findMany({
      where: { employeeId: body.employeeId },
      orderBy: { version: 'desc' },
      take: 1,
    });
    const version = (previous[0]?.version || 0) + 1;
    const approvalRequired = await hasApprovalFlow(body.companyId, 'CONTRACT_RENEWAL', this.prisma);
    const requestedStatus = body.status || 'Active';
    const status = approvalRequired && requestedStatus === 'Active' ? PENDING_APPROVAL_STATUS : requestedStatus;

    const data: any = {
      companyId: body.companyId,
      employeeId: body.employeeId,
      contractTypeId: body.contractTypeId || null,
      contractNumber: body.contractNumber || `CON-${Date.now().toString(36).toUpperCase()}`,
      status,
      approvedAt: status === 'Active' ? new Date() : null,
      approvedBy: status === 'Active' ? body.approvedBy || null : null,
      startDate: toDateOnlyStr(body.startDate) || body.startDate,
      endDate: toDateOnlyStr(body.endDate),
      probationEndDate: toDateOnlyStr(body.probationEndDate),
      signedDate: toDateOnlyStr(body.signedDate),
      noticePeriod: body.noticePeriod ? Number(body.noticePeriod) : null,
      autoRenew: !!body.autoRenew,
      salary: body.salary !== undefined && body.salary !== null && body.salary !== '' ? Number(body.salary) : null,
      currency: body.currency || 'TZS',
      fileUrl: body.fileUrl || null,
      fileName: body.fileName || null,
      template: body.template || null,
      version,
      parentContractId: body.parentContractId || null,
      metadata: body.metadata ? (typeof body.metadata === 'string' ? body.metadata : JSON.stringify(body.metadata)) : null,
    };

    const created = await this.prisma.contract.create({ data, include: this.contractInclude() });
    // Mirror key dates back onto the employee record so other modules see them.
    await this.prisma.employee.update({
      where: { id: body.employeeId },
      data: {
        contractTypeId: data.contractTypeId,
        contractStartDate: data.startDate,
        contractEndDate: data.endDate,
        probationEndDate: data.probationEndDate,
      },
    }).catch(() => {});

    return this.serialize(created);
  }

  async approve(id: string, body: { approvedBy?: string }) {
    const existing = await this.prisma.contract.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Contract not found');

    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        status: 'Active',
        approvedAt: new Date(),
        approvedBy: body.approvedBy || null,
      },
      include: this.contractInclude(),
    });

    const emp = await this.prisma.employee.findUnique({ where: { id: existing.employeeId }, include: { user: true } });
    if (emp?.user?.id) {
      await this.notifications.send(emp.user.id, {
        type: 'CONTRACT_APPROVED',
        title: 'Contract approved',
        message: 'Your contract has been approved and is now active.',
        link: '/dashboard/contracts',
        companyId: existing.companyId,
      }).catch(() => {});
    }

    return this.serialize(updated);
  }

  async update(id: string, body: any) {
    const existing = await this.prisma.contract.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Contract not found');

    const data: any = {};
    const passthrough = [
      'contractTypeId', 'contractNumber', 'status', 'template', 'fileUrl', 'fileName',
      'noticePeriod', 'currency',
    ];
    for (const k of passthrough) if (body[k] !== undefined) data[k] = body[k];
    if (body.startDate !== undefined) data.startDate = toDateOnlyStr(body.startDate) || body.startDate;
    if (body.endDate !== undefined) data.endDate = toDateOnlyStr(body.endDate);
    if (body.probationEndDate !== undefined) data.probationEndDate = toDateOnlyStr(body.probationEndDate);
    if (body.signedDate !== undefined) data.signedDate = toDateOnlyStr(body.signedDate);
    if (body.autoRenew !== undefined) data.autoRenew = !!body.autoRenew;
    if (body.salary !== undefined) data.salary = body.salary === '' || body.salary === null ? null : Number(body.salary);
    if (body.metadata !== undefined) {
      data.metadata = typeof body.metadata === 'string' ? body.metadata : JSON.stringify(body.metadata);
    }
    const updated = await this.prisma.contract.update({ where: { id }, data, include: this.contractInclude() });
    return this.serialize(updated);
  }

  /**
   * Extend pushes the existing contract's endDate further out. No new version is created.
   */
  async extend(id: string, body: { newEndDate: string; notes?: string }) {
    const existing = await this.prisma.contract.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Contract not found');
    if (!body.newEndDate) throw new BadRequestException('newEndDate required');
    const newEnd = toDateOnlyStr(body.newEndDate) || body.newEndDate;
    const meta = existing.metadata ? safeJson(existing.metadata) : {};
    const extensions = Array.isArray(meta.extensions) ? meta.extensions : [];
    extensions.push({ from: existing.endDate, to: newEnd, at: new Date().toISOString(), notes: body.notes || null });
    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        endDate: newEnd,
        status: 'Extended',
        metadata: JSON.stringify({ ...meta, extensions }),
      },
      include: this.contractInclude(),
    });
    // Mirror new end date onto employee.
    await this.prisma.employee.update({
      where: { id: existing.employeeId },
      data: { contractEndDate: newEnd },
    }).catch(() => {});
    return this.serialize(updated);
  }

  /**
   * Renew closes the current contract and creates a successor linked via parentContractId.
   */
  async renew(id: string, body: any) {
    const existing = await this.prisma.contract.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Contract not found');
    if (!body.startDate) throw new BadRequestException('startDate required');

    await this.prisma.contract.update({
      where: { id },
      data: { status: 'Renewed' },
    });

    const successor = await this.create({
      companyId: existing.companyId,
      employeeId: existing.employeeId,
      contractTypeId: body.contractTypeId || existing.contractTypeId,
      startDate: body.startDate,
      endDate: body.endDate,
      probationEndDate: body.probationEndDate,
      signedDate: body.signedDate || new Date().toISOString(),
      noticePeriod: body.noticePeriod ?? existing.noticePeriod,
      autoRenew: body.autoRenew ?? existing.autoRenew,
      salary: body.salary ?? existing.salary,
      currency: body.currency || existing.currency,
      fileUrl: body.fileUrl || null,
      fileName: body.fileName || null,
      template: body.template || existing.template,
      parentContractId: existing.id,
      metadata: { renewalNotes: body.notes || null },
    });

    // Notify the employee's user account, if any.
    try {
      const emp = await this.prisma.employee.findUnique({ where: { id: existing.employeeId }, include: { user: true } });
      if (emp?.user?.id) {
        await this.notifications.send(emp.user.id, {
          type: 'CONTRACT_RENEWED',
          title: 'Contract renewed',
          message: `Your contract has been renewed effective ${successor.startDate}.`,
          link: '/dashboard/contracts',
          companyId: existing.companyId,
        }).catch(() => {});
      }
    } catch {}

    return successor;
  }

  /**
   * Terminate marks contract as terminated and triggers offboarding on the employee.
   */
  async terminate(id: string, body: { reason: string; notes?: string; terminatedBy?: string; effectiveDate?: string }) {
    const existing = await this.prisma.contract.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Contract not found');
    if (!body.reason) throw new BadRequestException('reason required');

    const effective = toDateOnlyStr(body.effectiveDate) || new Date().toISOString().slice(0, 10);
    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        status: 'Terminated',
        terminationReason: body.reason,
        terminationNotes: body.notes || null,
        terminatedAt: new Date(),
        terminatedBy: body.terminatedBy || null,
        endDate: effective,
      },
      include: this.contractInclude(),
    });

    // Move the employee into offboarding state so the offboarding module picks it up.
    await this.prisma.employee.update({
      where: { id: existing.employeeId },
      data: {
        stage: 'Offboarding',
        status: 'Inactive',
        endDate: effective,
      },
    }).catch(() => {});

    const offboardingApprovalRequired = await hasApprovalFlow(existing.companyId, 'OFFBOARDING', this.prisma);
    const existingOffboarding = await this.prisma.offboarding.findFirst({
      where: {
        companyId: existing.companyId,
        employeeId: existing.employeeId,
        contractId: existing.id,
      },
      select: { id: true },
    });
    if (!existingOffboarding) {
      await this.prisma.offboarding.create({
        data: {
          companyId: existing.companyId,
          employeeId: existing.employeeId,
          contractId: existing.id,
          reason: body.reason,
          type: 'Without Payment',
          exitDate: effective,
          settlementJson: body.notes ? JSON.stringify({ notes: body.notes }) : null,
          approvalStage: offboardingApprovalRequired ? 0 : 1,
          status: offboardingApprovalRequired ? 'Pending Approval' : 'In Progress',
          approvedAt: offboardingApprovalRequired ? null : new Date(),
          approvedBy: offboardingApprovalRequired ? null : body.terminatedBy || null,
        },
      }).catch(() => {});
    }

    // Notify employee + HR (best-effort).
    try {
      const emp = await this.prisma.employee.findUnique({ where: { id: existing.employeeId }, include: { user: true } });
      if (emp?.user?.id) {
        await this.notifications.send(emp.user.id, {
          type: 'CONTRACT_TERMINATED',
          title: 'Contract terminated',
          message: `Your contract has been terminated effective ${effective}. Reason: ${body.reason}.`,
          link: '/dashboard/contracts',
          companyId: existing.companyId,
        }).catch(() => {});
      }
    } catch {}

    return this.serialize(updated);
  }

  /**
   * Attach an uploaded file URL (signed contract PDF, addendum, etc.).
   */
  async attachFile(id: string, body: { fileUrl: string; fileName?: string }) {
    const existing = await this.prisma.contract.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Contract not found');
    if (!body.fileUrl) throw new BadRequestException('fileUrl required');
    const meta = existing.metadata ? safeJson(existing.metadata) : {};
    const files = Array.isArray(meta.files) ? meta.files : [];
    files.push({ url: body.fileUrl, name: body.fileName || null, uploadedAt: new Date().toISOString() });
    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        fileUrl: body.fileUrl,
        fileName: body.fileName || existing.fileName,
        signedDate: existing.signedDate || new Date().toISOString().slice(0, 10),
        metadata: JSON.stringify({ ...meta, files }),
      },
      include: this.contractInclude(),
    });
    return this.serialize(updated);
  }

  /**
   * Auto-create a contract from an employee record when their onboarding is approved.
   * Idempotent — if an active/non-terminated contract already exists, returns it.
   */
  async ensureContractForEmployee(employeeId: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) return null;
    const existing = await this.prisma.contract.findFirst({
      where: { employeeId, terminatedAt: null, status: { notIn: ['Terminated', 'Renewed'] } },
    });
    if (existing) return existing;
    if (!emp.contractStartDate) return null;
    const approvalRequired = await hasApprovalFlow(emp.companyId, 'CONTRACT_RENEWAL', this.prisma);
    return this.create({
      companyId: emp.companyId,
      employeeId: emp.id,
      contractTypeId: emp.contractTypeId || null,
      startDate: emp.contractStartDate,
      endDate: emp.contractEndDate,
      probationEndDate: emp.probationEndDate,
      signedDate: new Date().toISOString().slice(0, 10),
      salary: emp.basicSalary ? Number(emp.basicSalary) : null,
      currency: emp.currency || 'TZS',
      status: approvalRequired ? PENDING_APPROVAL_STATUS : 'Active',
      metadata: { source: 'onboarding-auto' },
    });
  }
}

function safeJson(s: string): any {
  try { return JSON.parse(s); } catch { return {}; }
}
