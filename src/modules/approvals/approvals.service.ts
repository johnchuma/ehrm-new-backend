import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';

/**
 * Single approval workflow for the whole app. There is NO separate approval
 * table — the source of truth is each record's own `status` + `approvalStage`
 * fields (exactly what the company-admin endpoints use), and the workflow shape
 * comes from `WorkspaceApprovalConfig` (levels + reviewer/approver designations).
 * A record at `approvalStage = k` is awaiting step k+1; when the final configured
 * step approves, the record is finalized. Employee-dashboard tasks are addressed
 * by a composite ref `TYPE:recordId` (e.g. `LEAVE:clx123`) since there is no row.
 */

const MANAGER_DESIGNATIONS = ['manager', 'reporting manager', 'line manager', 'supervisor', 'direct manager'];
type Decision = 'APPROVE' | 'REJECT';

interface Actor {
  id: string;
  role: string | null;
  employeeId: string | null;
  fullName: string | null;
  companyId: string | null;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
}

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  // ── helpers ──────────────────────────────────────────────────────────────

  private norm(v?: string | null): string {
    return String(v || '').toLowerCase().replace(/[\s_-]+/g, ' ').trim();
  }

  private parseList(text?: string | null): string[] {
    if (!text) return [];
    try {
      const value = typeof text === 'string' ? JSON.parse(text) : text;
      return Array.isArray(value) ? value.map((v) => String(v)).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  private parseRef(ref: string): { type: string; targetId: string } {
    const idx = String(ref || '').indexOf(':');
    if (idx < 0) throw new BadRequestException('Invalid approval reference');
    return { type: ref.slice(0, idx).toUpperCase(), targetId: ref.slice(idx + 1) };
  }

  private async loadActor(userId: string): Promise<Actor> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, employeeId: true, fullName: true, companyId: true },
    });
    if (!u) throw new NotFoundException('User not found');
    const r = this.norm(u.role);
    return {
      ...u,
      isSuperAdmin: r === 'system administrator' || r === 'system admin',
      isCompanyAdmin: r === 'company admin' || r === 'company administrator',
    };
  }

  /** Ordered step designations for a module: [...reviewers, ...approvers]. */
  private async getSequence(companyId: string, moduleKey: string): Promise<string[]> {
    const cfg = await this.prisma.workspaceApprovalConfig.findFirst({
      where: { companyId, moduleKey, isActive: true },
    });
    const seq = cfg ? [...this.parseList(cfg.reviewers), ...this.parseList(cfg.approvers)] : [];
    return seq.length ? seq : ['manager']; // no config → single reporting-manager step
  }

  /** Can this actor act on the step with `designation`, for a record whose initiator reports to `managerEmployeeId`? */
  private eligible(actor: Actor, designation: string, managerEmployeeId: string | null): boolean {
    if (actor.isSuperAdmin || actor.isCompanyAdmin) return true; // admins can always act
    const d = this.norm(designation);
    if (!d || MANAGER_DESIGNATIONS.includes(d)) {
      return !!(managerEmployeeId && actor.employeeId && managerEmployeeId === actor.employeeId);
    }
    return this.norm(actor.role) === d;
  }

  /** Resolve a designation to a concrete userId (for notifications). */
  private async resolveApproverUserId(companyId: string, designation: string, managerEmployeeId: string | null): Promise<string | null> {
    const d = this.norm(designation);
    if (!d || MANAGER_DESIGNATIONS.includes(d)) {
      if (managerEmployeeId) {
        const m = await this.prisma.employee.findUnique({ where: { id: managerEmployeeId }, select: { userId: true } });
        if (m?.userId) return m.userId;
      }
    } else {
      const emp = await this.prisma.employee.findFirst({ where: { companyId, role: designation, NOT: { userId: null } }, select: { userId: true } });
      if (emp?.userId) return emp.userId;
      const usr = await this.prisma.user.findFirst({ where: { companyId, role: designation }, select: { id: true } });
      if (usr) return usr.id;
    }
    if (managerEmployeeId) {
      const m = await this.prisma.employee.findUnique({ where: { id: managerEmployeeId }, select: { userId: true } });
      if (m?.userId) return m.userId;
    }
    return null;
  }

  /** Visual approval chain synthesized from config + current stage. */
  private buildChain(seq: string[], approvalStage: number, status: string) {
    return seq.map((designation, i) => {
      let state: string;
      if (status === 'REJECTED') state = i < approvalStage ? 'APPROVED' : i === approvalStage ? 'REJECTED' : 'PENDING';
      else if (status === 'APPROVED') state = 'APPROVED';
      else state = i < approvalStage ? 'APPROVED' : i === approvalStage ? 'CURRENT' : 'PENDING';
      return { step: i + 1, designation, state };
    });
  }

  private async notify(userId: string | null | undefined, title: string, message: string, companyId?: string | null) {
    if (!userId) return;
    try {
      await this.notifications.send(userId, { type: 'APPROVAL', title, message, link: '/approvals', companyId: companyId ?? undefined });
    } catch {
      /* best-effort */
    }
  }

  // ── LEAVE decision (shared by /approvals and the admin leave-admin.respond) ─

  async decideLeave(
    actorUserId: string,
    leaveRequestId: string,
    decision: Decision,
    comments?: string,
    opts?: { bypassEligibility?: boolean },
  ) {
    const actor = await this.loadActor(actorUserId);
    const lr = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: { employee: { select: { managerId: true, userId: true } } },
    });
    if (!lr) throw new NotFoundException('Leave request not found');
    if (lr.status !== 'PENDING') throw new BadRequestException('This request is not pending approval');

    const seq = await this.getSequence(lr.companyId, lr.approvalConfigKey || 'LEAVE');
    const levels = seq.length;
    const stage = lr.approvalStage ?? 0;
    const designation = seq[Math.min(stage, levels - 1)];
    // The admin management surface (leave-admin) is already permission-gated and
    // may override the per-stage designation check; the employee dashboard enforces it.
    if (!opts?.bypassEligibility && !this.eligible(actor, designation, lr.employee?.managerId ?? null)) {
      throw new ForbiddenException('You are not an approver for the current stage');
    }
    const year = new Date(lr.startDate).getFullYear();

    if (decision === 'REJECT') {
      await this.prisma.$transaction([
        this.prisma.leaveRequest.update({
          where: { id: leaveRequestId },
          data: { status: 'REJECTED', approverId: actor.employeeId ?? null, rejectionReason: comments ?? null },
        }),
        this.prisma.leaveBalance.updateMany({
          where: { employeeId: lr.employeeId, leaveTypeId: lr.leaveTypeId, year },
          data: { pendingDays: { decrement: Number(lr.totalDays) } },
        }),
      ]);
      await this.notify(lr.employee?.userId, 'Leave rejected', 'Your leave request was rejected.', lr.companyId);
      return { status: 'REJECTED', approvalStage: stage, totalSteps: levels };
    }

    // APPROVE — advance a step; finalize only at the last configured level.
    const newStage = stage + 1;
    if (newStage >= levels) {
      await this.prisma.$transaction([
        this.prisma.leaveRequest.update({
          where: { id: leaveRequestId },
          data: { status: 'APPROVED', approvalStage: newStage, approverId: actor.employeeId ?? null, approvedAt: new Date() },
        }),
        this.prisma.leaveBalance.updateMany({
          where: { employeeId: lr.employeeId, leaveTypeId: lr.leaveTypeId, year },
          data: { usedDays: { increment: Number(lr.totalDays) }, pendingDays: { decrement: Number(lr.totalDays) } },
        }),
      ]);
      await this.notify(lr.employee?.userId, 'Leave approved', 'Your leave request was approved.', lr.companyId);
      return { status: 'APPROVED', approvalStage: newStage, totalSteps: levels };
    }

    await this.prisma.leaveRequest.update({ where: { id: leaveRequestId }, data: { approvalStage: newStage } });
    const nextUserId = await this.resolveApproverUserId(lr.companyId, seq[newStage], lr.employee?.managerId ?? null);
    await this.notify(nextUserId, 'Approval awaiting your action', 'A leave request needs your review.', lr.companyId);
    return { status: 'PENDING', approvalStage: newStage, totalSteps: levels };
  }

  // ── OVERTIME decision (single step; authorization lives on Attendance.approvedBy) ─

  async decideOvertime(
    actorUserId: string,
    attendanceId: string,
    decision: Decision,
    comments?: string,
    opts?: { bypassEligibility?: boolean },
  ) {
    const actor = await this.loadActor(actorUserId);
    const att = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { employee: { select: { managerId: true, userId: true } } },
    });
    if (!att) throw new NotFoundException('Attendance record not found');
    if (!Number(att.overtime || 0)) throw new BadRequestException('This record has no overtime');
    if (att.approvedBy && !opts?.bypassEligibility) throw new BadRequestException('Overtime has already been decided');

    const seq = await this.getSequence(att.companyId, 'OVERTIME');
    if (!opts?.bypassEligibility && !this.eligible(actor, seq[0], att.employee?.managerId ?? null)) {
      throw new ForbiddenException('You are not an approver for overtime');
    }
    const name = actor.fullName || 'Approver';
    // Payroll pays OT when approvedBy is set and does NOT start with 'UNAUTHORIZED:'.
    await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { approvedBy: decision === 'APPROVE' ? name : `UNAUTHORIZED:${name}` },
    });
    const authorized = decision === 'APPROVE';
    await this.notify(
      att.employee?.userId,
      authorized ? 'Overtime authorized' : 'Overtime declined',
      authorized ? 'Your overtime was authorized.' : `Your overtime was not authorized${comments ? `: ${comments}` : ''}.`,
      att.companyId,
    );
    return { status: authorized ? 'APPROVED' : 'REJECTED' };
  }

  // ── Approver actions from the employee dashboard ──

  async submit(userId: string, ref: string, dto: { action?: string; comments?: string }) {
    const { type, targetId } = this.parseRef(ref);
    const a = this.norm(dto.action);
    const decision: Decision =
      a === 'approve' || a === 'approved' ? 'APPROVE' : a === 'reject' || a === 'rejected' ? 'REJECT' : (null as any);
    if (!decision) throw new BadRequestException('action must be APPROVE or REJECT');

    if (type === 'LEAVE') return this.decideLeave(userId, targetId, decision, dto.comments);
    if (type === 'OVERTIME') return this.decideOvertime(userId, targetId, decision, dto.comments);
    throw new BadRequestException(`Unsupported approval type: ${type}`);
  }

  // ── Queries ──

  /** Approver inbox — pending records where the actor is eligible at the current stage. */
  async getMyTasks(userId: string, companyId: string, opts: { type?: string } = {}) {
    const actor = await this.loadActor(userId);
    const co = companyId || actor.companyId;
    if (!co) return [];
    const tasks: any[] = [];

    if (!opts.type || opts.type.toUpperCase() === 'LEAVE') {
      const seq = await this.getSequence(co, 'LEAVE');
      const leaves = await this.prisma.leaveRequest.findMany({
        where: { companyId: co, status: 'PENDING' },
        include: {
          leaveType: { select: { name: true, code: true } },
          employee: { select: { id: true, fullName: true, managerId: true, department: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
      for (const lr of leaves) {
        const stage = lr.approvalStage ?? 0;
        const designation = seq[Math.min(stage, seq.length - 1)];
        if (!this.eligible(actor, designation, lr.employee?.managerId ?? null)) continue;
        tasks.push({
          id: `LEAVE:${lr.id}`,
          type: 'LEAVE',
          status: lr.status,
          currentStep: stage + 1,
          totalSteps: seq.length,
          currentApprover: designation,
          initiator: { name: lr.employee?.fullName ?? null, department: lr.employee?.department?.name ?? null },
          summary: { leaveType: lr.leaveType?.name, startDate: lr.startDate, endDate: lr.endDate, days: Number(lr.totalDays || 0), reason: lr.reason },
          chain: this.buildChain(seq, stage, lr.status),
          createdAt: lr.createdAt,
        });
      }
    }

    if (!opts.type || opts.type.toUpperCase() === 'OVERTIME') {
      const seq = await this.getSequence(co, 'OVERTIME');
      const ots = await this.prisma.attendance.findMany({
        where: { companyId: co, overtime: { gt: 0 }, approvedBy: null },
        include: { employee: { select: { id: true, fullName: true, managerId: true } } },
        orderBy: { date: 'desc' },
      });
      for (const att of ots) {
        if (!this.eligible(actor, seq[0], att.employee?.managerId ?? null)) continue;
        tasks.push({
          id: `OVERTIME:${att.id}`,
          type: 'OVERTIME',
          status: 'PENDING',
          currentStep: 1,
          totalSteps: seq.length,
          currentApprover: seq[0],
          initiator: { name: att.employee?.fullName ?? null, department: null },
          summary: { date: att.date, overtimeMinutes: att.overtime, checkIn: att.checkIn, checkOut: att.checkOut },
          chain: this.buildChain(seq, 0, 'PENDING'),
          createdAt: att.createdAt,
        });
      }
    }

    return tasks.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
  }

  /** An employee's own submitted requests, with approval progress. */
  async getMyRequests(userId: string, status?: string) {
    const actor = await this.loadActor(userId);
    if (!actor.employeeId || !actor.companyId) return [];
    const out: any[] = [];

    const seqLeave = await this.getSequence(actor.companyId, 'LEAVE');
    const leaves = await this.prisma.leaveRequest.findMany({
      where: { employeeId: actor.employeeId, ...(status ? { status } : {}) },
      include: { leaveType: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
    for (const lr of leaves) {
      out.push({
        id: `LEAVE:${lr.id}`,
        type: 'LEAVE',
        status: lr.status,
        currentStep: (lr.approvalStage ?? 0) + 1,
        totalSteps: seqLeave.length,
        summary: { leaveType: lr.leaveType?.name, startDate: lr.startDate, endDate: lr.endDate, days: Number(lr.totalDays || 0) },
        chain: this.buildChain(seqLeave, lr.approvalStage ?? 0, lr.status),
        rejectionReason: lr.rejectionReason || null,
        createdAt: lr.createdAt,
      });
    }

    const ots = await this.prisma.attendance.findMany({
      where: { employeeId: actor.employeeId, overtime: { gt: 0 } },
      orderBy: { date: 'desc' },
    });
    for (const att of ots) {
      const decided = !!att.approvedBy;
      const authorized = decided && !String(att.approvedBy).toUpperCase().startsWith('UNAUTHORIZED:');
      out.push({
        id: `OVERTIME:${att.id}`,
        type: 'OVERTIME',
        status: !decided ? 'PENDING' : authorized ? 'APPROVED' : 'REJECTED',
        summary: { date: att.date, overtimeMinutes: att.overtime },
        createdAt: att.createdAt,
      });
    }

    return out
      .filter((r) => (status ? r.status === status : true))
      .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
  }

  async getTargetDetails(userId: string, ref: string) {
    const { type, targetId } = this.parseRef(ref);
    if (type === 'LEAVE') {
      const lr = await this.prisma.leaveRequest.findUnique({
        where: { id: targetId },
        include: {
          leaveType: { select: { name: true, code: true, isPaid: true } },
          employee: { select: { id: true, fullName: true, department: { select: { name: true } } } },
        },
      });
      if (!lr) throw new NotFoundException('Leave request not found');
      const seq = await this.getSequence(lr.companyId, lr.approvalConfigKey || 'LEAVE');
      return { type, target: lr, chain: this.buildChain(seq, lr.approvalStage ?? 0, lr.status) };
    }
    if (type === 'OVERTIME') {
      const att = await this.prisma.attendance.findUnique({
        where: { id: targetId },
        include: { employee: { select: { id: true, fullName: true } } },
      });
      if (!att) throw new NotFoundException('Attendance record not found');
      return { type, target: att };
    }
    throw new BadRequestException(`Unsupported approval type: ${type}`);
  }

  /** Resolved approver chain for a module (from the config designations). */
  async getApprovers(companyId: string, moduleKey?: string) {
    const key = moduleKey || 'LEAVE';
    const seq = await this.getSequence(companyId, key);
    const approvers = [];
    for (let i = 0; i < seq.length; i++) {
      const userId = await this.resolveApproverUserId(companyId, seq[i], null);
      let name: string | null = null;
      if (userId) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, email: true } });
        name = u?.fullName || u?.email || null;
      }
      approvers.push({ step: i + 1, designation: seq[i], userId, name });
    }
    return { moduleKey: key, sequence: seq, approvers };
  }
}
