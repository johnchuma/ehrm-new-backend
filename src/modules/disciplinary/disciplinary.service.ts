import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';

function toDateOnlyStr(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

const STEP_BY_STATUS: Record<string, number> = {
  Investigation: 1,
  'Notice Issued': 2,
  'Hearing Scheduled': 3,
  'Pending Outcome': 4,
  Closed: 5,
  Appealed: 4,
};

@Injectable()
export class DisciplinaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  // ─────────────── Helpers ───────────────

  private caseInclude() {
    return {
      hearings: { orderBy: { date: 'asc' as const } },
      outcomes: { orderBy: { decisionDate: 'desc' as const } },
      appeals: { orderBy: { submittedDate: 'desc' as const } },
    } as const;
  }

  private async nextCaseNumber(companyId: string): Promise<string> {
    const count = await this.prisma.disciplinaryCase.count({ where: { companyId } });
    return `DISC-${String(count + 1).padStart(3, '0')}`;
  }

  // ─────────────── Cases ───────────────

  async listCases(filters: {
    companyId?: string;
    status?: string;
    severity?: string;
    category?: string;
    search?: string;
  }) {
    const where: any = {};
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.severity && filters.severity !== 'All') where.severity = filters.severity;
    if (filters.category && filters.category !== 'All') where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { caseNumber: { contains: filters.search } },
        { employeeName: { contains: filters.search } },
        { allegation: { contains: filters.search } },
        { reportedBy: { contains: filters.search } },
        { caseOfficer: { contains: filters.search } },
      ];
    }
    return this.prisma.disciplinaryCase.findMany({
      where,
      include: this.caseInclude(),
      orderBy: { reportedDate: 'desc' },
    });
  }

  async getCase(id: string) {
    const c = await this.prisma.disciplinaryCase.findUnique({
      where: { id },
      include: this.caseInclude(),
    });
    if (!c) throw new NotFoundException('Case not found');
    return c;
  }

  async createCase(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.employeeName) throw new BadRequestException('employeeName required');
    if (!body.allegation) throw new BadRequestException('allegation required');
    if (!body.reportedDate) throw new BadRequestException('reportedDate required');

    const caseNumber = body.caseNumber || (await this.nextCaseNumber(body.companyId));
    const status = body.status || 'Investigation';
    const step = body.step ?? STEP_BY_STATUS[status] ?? 1;

    const created = await this.prisma.disciplinaryCase.create({
      data: {
        companyId: body.companyId,
        caseNumber,
        employeeId: body.employeeId || null,
        employeeName: body.employeeName,
        department: body.department || null,
        allegation: body.allegation,
        category: body.category || 'Misconduct',
        severity: body.severity || 'Minor',
        reportedById: body.reportedById || null,
        reportedBy: body.reportedBy || null,
        reportedDate: toDateOnlyStr(body.reportedDate),
        status,
        caseOfficerId: body.caseOfficerId || null,
        caseOfficer: body.caseOfficer || null,
        step,
        notes: body.notes || null,
        createdById: body.createdById || null,
      },
      include: this.caseInclude(),
    });
    return created;
  }

  async updateCase(id: string, body: any) {
    const existing = await this.prisma.disciplinaryCase.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Case not found');
    const data: any = {};
    const passthrough = [
      'employeeId', 'employeeName', 'department', 'allegation', 'category', 'severity',
      'reportedById', 'reportedBy', 'status', 'caseOfficerId', 'caseOfficer', 'notes',
    ];
    for (const k of passthrough) if (body[k] !== undefined) data[k] = body[k];
    if (body.reportedDate !== undefined) data.reportedDate = toDateOnlyStr(body.reportedDate);
    if (body.status !== undefined) data.step = body.step ?? STEP_BY_STATUS[body.status] ?? existing.step;
    if (body.status === 'Closed' && !existing.closedAt) data.closedAt = new Date();
    return this.prisma.disciplinaryCase.update({ where: { id }, data, include: this.caseInclude() });
  }

  async deleteCase(id: string) {
    const existing = await this.prisma.disciplinaryCase.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Case not found');
    return this.prisma.disciplinaryCase.delete({ where: { id } });
  }

  async stats(companyId: string) {
    const cases = await this.prisma.disciplinaryCase.findMany({
      where: { companyId },
      select: { id: true, status: true, category: true, severity: true, reportedDate: true },
    });
    const openCases = cases.filter((c) => c.status !== 'Closed').length;
    const closed = cases.filter((c) => c.status === 'Closed').length;
    const hearings = await this.prisma.disciplinaryHearing.count({
      where: { companyId, status: 'Scheduled' },
    });
    const pendingOutcomes = cases.filter((c) => c.status === 'Pending Outcome').length;
    const appeals = await this.prisma.disciplinaryAppeal.count({ where: { companyId } });
    const byCategory = cases.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
    const bySeverity = cases.reduce<Record<string, number>>((acc, c) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1;
      return acc;
    }, {});
    return { total: cases.length, openCases, closed, hearings, pendingOutcomes, appeals, byCategory, bySeverity };
  }

  // ─────────────── Hearings ───────────────

  async listHearings(companyId: string, caseId?: string, status?: string) {
    const where: any = { companyId };
    if (caseId) where.caseId = caseId;
    if (status && status !== 'All') where.status = status;
    return this.prisma.disciplinaryHearing.findMany({
      where,
      include: { case: { select: { id: true, caseNumber: true, employeeName: true, department: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async createHearing(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.caseId) throw new BadRequestException('caseId required');
    if (!body.date) throw new BadRequestException('date required');
    const witnesses = Array.isArray(body.witnesses) ? JSON.stringify(body.witnesses) : (body.witnesses || null);
    const panelMembers = Array.isArray(body.panelMembers) ? JSON.stringify(body.panelMembers) : (body.panelMembers || null);

    const hearing = await this.prisma.disciplinaryHearing.create({
      data: {
        companyId: body.companyId,
        caseId: body.caseId,
        date: toDateOnlyStr(body.date),
        time: body.time || null,
        venue: body.venue || null,
        panelChair: body.panelChair || null,
        panelMembers,
        witnesses,
        status: body.status || 'Scheduled',
        outcome: body.outcome || null,
        notes: body.notes || null,
        createdById: body.createdById || null,
      },
      include: { case: { select: { id: true, caseNumber: true, employeeName: true } } },
    });
    // Move the case to "Hearing Scheduled"
    await this.prisma.disciplinaryCase.update({
      where: { id: body.caseId },
      data: { status: 'Hearing Scheduled', step: STEP_BY_STATUS['Hearing Scheduled'] },
    }).catch(() => {});
    return hearing;
  }

  async updateHearing(id: string, body: any) {
    const existing = await this.prisma.disciplinaryHearing.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Hearing not found');
    const data: any = {};
    const passthrough = ['time', 'venue', 'panelChair', 'status', 'outcome', 'notes'];
    for (const k of passthrough) if (body[k] !== undefined) data[k] = body[k];
    if (body.date !== undefined) data.date = toDateOnlyStr(body.date);
    if (body.witnesses !== undefined) {
      data.witnesses = Array.isArray(body.witnesses) ? JSON.stringify(body.witnesses) : body.witnesses;
    }
    if (body.panelMembers !== undefined) {
      data.panelMembers = Array.isArray(body.panelMembers) ? JSON.stringify(body.panelMembers) : body.panelMembers;
    }
    const updated = await this.prisma.disciplinaryHearing.update({
      where: { id },
      data,
      include: { case: { select: { id: true, caseNumber: true, employeeName: true } } },
    });
    // Sync parent case when hearing outcome recorded
    if (body.status === 'Completed' && body.outcome) {
      await this.prisma.disciplinaryCase.update({
        where: { id: existing.caseId },
        data: { status: 'Pending Outcome', step: STEP_BY_STATUS['Pending Outcome'] },
      }).catch(() => {});
    }
    return updated;
  }

  // ─────────────── Outcomes ───────────────

  async listOutcomes(companyId: string, caseId?: string) {
    const where: any = { companyId };
    if (caseId) where.caseId = caseId;
    return this.prisma.disciplinaryOutcome.findMany({
      where,
      include: { case: { select: { id: true, caseNumber: true, employeeName: true, department: true } } },
      orderBy: { decisionDate: 'desc' },
    });
  }

  async createOutcome(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.caseId) throw new BadRequestException('caseId required');
    if (!body.decision) throw new BadRequestException('decision required');
    if (!body.decisionDate) throw new BadRequestException('decisionDate required');
    const outcome = await this.prisma.disciplinaryOutcome.create({
      data: {
        companyId: body.companyId,
        caseId: body.caseId,
        decision: body.decision,
        decisionDate: toDateOnlyStr(body.decisionDate),
        effectiveDate: toDateOnlyStr(body.effectiveDate),
        appealed: !!body.appealed,
        notes: body.notes || null,
        issuedById: body.issuedById || null,
        issuedBy: body.issuedBy || null,
      },
      include: { case: { select: { id: true, caseNumber: true, employeeName: true } } },
    });
    // Mark case closed
    await this.prisma.disciplinaryCase.update({
      where: { id: body.caseId },
      data: { status: 'Closed', step: STEP_BY_STATUS.Closed, closedAt: new Date() },
    }).catch(() => {});
    return outcome;
  }

  // ─────────────── Appeals ───────────────

  async listAppeals(companyId: string, caseId?: string, status?: string) {
    const where: any = { companyId };
    if (caseId) where.caseId = caseId;
    if (status && status !== 'All') where.status = status;
    return this.prisma.disciplinaryAppeal.findMany({
      where,
      include: { case: { select: { id: true, caseNumber: true, employeeName: true, department: true } } },
      orderBy: { submittedDate: 'desc' },
    });
  }

  async createAppeal(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.caseId) throw new BadRequestException('caseId required');
    if (!body.groundsForAppeal) throw new BadRequestException('groundsForAppeal required');
    if (!body.submittedDate) throw new BadRequestException('submittedDate required');
    const appeal = await this.prisma.disciplinaryAppeal.create({
      data: {
        companyId: body.companyId,
        caseId: body.caseId,
        groundsForAppeal: body.groundsForAppeal,
        submittedDate: toDateOnlyStr(body.submittedDate),
        status: body.status || 'Under Review',
        hearingDate: toDateOnlyStr(body.hearingDate),
        panelDecision: body.panelDecision || null,
      },
      include: { case: { select: { id: true, caseNumber: true, employeeName: true } } },
    });
    // Mark the case as Appealed
    await this.prisma.disciplinaryCase.update({
      where: { id: body.caseId },
      data: { status: 'Appealed', step: STEP_BY_STATUS.Appealed },
    }).catch(() => {});
    return appeal;
  }

  async updateAppeal(id: string, body: any) {
    const existing = await this.prisma.disciplinaryAppeal.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Appeal not found');
    const data: any = {};
    const passthrough = ['status', 'panelDecision'];
    for (const k of passthrough) if (body[k] !== undefined) data[k] = body[k];
    if (body.hearingDate !== undefined) data.hearingDate = toDateOnlyStr(body.hearingDate);
    if (body.groundsForAppeal !== undefined) data.groundsForAppeal = body.groundsForAppeal;
    if (body.status && ['Upheld', 'Dismissed'].includes(body.status)) {
      data.decidedAt = new Date();
      data.decidedBy = body.decidedBy || null;
    }
    return this.prisma.disciplinaryAppeal.update({
      where: { id },
      data,
      include: { case: { select: { id: true, caseNumber: true, employeeName: true } } },
    });
  }
}
