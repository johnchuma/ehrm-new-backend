import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface IntentHints {
  topics: string[];
  wantsAction: boolean;
  actionType?: string;
}

export interface AiResponse {
  reply: string;
  actions: Array<{ label: string; type: string; target?: string }>;
  suggestedAction: string | null;
  intent: string;
  context: Record<string, any>;
  usage?: any;
  source: 'openai' | 'fallback';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {}

  async chat(
    companyId: string | undefined,
    userId: string | undefined,
    messages: ChatMessage[],
    clientContext: Record<string, any> = {},
  ): Promise<AiResponse> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const intent = this.detectIntent(lastUser);
    const context = await this.buildContext(companyId, userId, intent);
    const enrichedContext = { ...context, ...clientContext };

    if (!process.env.OPENAI_API_KEY) {
      return this.fallbackResponse(lastUser, intent, enrichedContext);
    }

    const systemPrompt = this.buildSystemPrompt(enrichedContext, intent);
    try {
      const data = await this.callOpenAI(systemPrompt, messages);
      const reply = data.choices?.[0]?.message?.content?.trim() || this.fallbackText(intent);
      const actions = this.buildActions(intent, enrichedContext);
      return {
        reply,
        actions,
        suggestedAction: actions[0]?.type ?? null,
        intent: intent.actionType ?? 'general',
        context: enrichedContext,
        usage: data.usage,
        source: 'openai',
      };
    } catch (err: any) {
      this.logger.warn(`OpenAI call failed, falling back: ${err?.message ?? err}`);
      return this.fallbackResponse(lastUser, intent, enrichedContext);
    }
  }

  // ── Intent detection ────────────────────────────────────────────────────
  private detectIntent(text: string): IntentHints {
    const q = (text || '').toLowerCase();
    const topics: string[] = [];
    let actionType: string | undefined;
    let wantsAction = false;

    if (/(leave|holiday|pto|vacation|sick)/.test(q)) topics.push('leave');
    if (/(payroll|payslip|salary|wage|paye|nssf|sdl|wcf|deduction)/.test(q)) topics.push('payroll');
    if (/(attendance|present|absent|late|check[ -]?in|shift)/.test(q)) topics.push('attendance');
    if (/(training|course|certification|learn)/.test(q)) topics.push('training');
    if (/(performance|review|goal|kpi|appraisal)/.test(q)) topics.push('performance');
    if (/(contract|renew|expir|probation)/.test(q)) topics.push('contracts');
    if (/(benefit|insurance|medical|pension)/.test(q)) topics.push('benefits');
    if (/(expense|reimburse|claim)/.test(q)) topics.push('expenses');
    if (/(compliance|labour|statutory|audit)/.test(q)) topics.push('compliance');
    if (/(headcount|hiring|recruit|attrition|turnover|onboard|offboard)/.test(q)) topics.push('workforce');
    if (/(salary|benchmark|compa|pay band|market gap)/.test(q)) topics.push('salary');

    if (/(run|start|stage|prepare|process|submit|approve|pay|raise|create|open|book|apply)/.test(q)) {
      wantsAction = true;
    }

    if (/(run payroll|stage payroll|process payroll|start payroll)/.test(q)) actionType = 'OPEN_PAYROLL_RUN';
    else if (/(apply for leave|book leave|request leave|submit leave)/.test(q)) actionType = 'OPEN_LEAVE_APPLY';
    else if (/(raise.*query|open.*hr query|hr query)/.test(q)) actionType = 'OPEN_HR_QUERY';
    else if (/(submit expense|file expense|expense claim)/.test(q)) actionType = 'OPEN_EXPENSE';
    else if (/(draft.*contract|renew.*contract)/.test(q)) actionType = 'OPEN_CONTRACTS';
    else if (/(approve.*leave|review.*leave)/.test(q)) actionType = 'OPEN_LEAVE_ADMIN';
    else if (/(onboard)/.test(q)) actionType = 'OPEN_ONBOARDING';
    else if (/(offboard)/.test(q)) actionType = 'OPEN_OFFBOARDING';
    else if (/(training.*approve|approve.*training)/.test(q)) actionType = 'OPEN_TRAINING';

    return { topics, wantsAction, actionType };
  }

  // ── Live context building ──────────────────────────────────────────────
  private async buildContext(companyId?: string, userId?: string, intent?: IntentHints) {
    if (!companyId) return this.emptyContext();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    const next30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const broad = intent?.topics.length === 0 || intent?.topics.length === undefined;
    const wants = (topic: string) => broad || intent?.topics.includes(topic);

    const queries: any[] = [];

    if (wants('workforce') || broad) {
      queries.push(
        this.prisma.employee
          .count({ where: { companyId } })
          .then((totalEmployees) => ({ totalEmployees })),
        this.prisma.employee
          .count({ where: { companyId, status: 'ACTIVE' } })
          .then((activeEmployees) => ({ activeEmployees })),
        this.prisma.employee
          .count({
            where: { companyId, startDate: { gte: monthStart, lte: monthEnd } },
          })
          .then((newHiresMTD) => ({ newHiresMTD })),
        this.prisma.employee
          .count({
            where: { companyId, endDate: { gte: monthStart, lte: monthEnd } },
          })
          .then((exitsMTD) => ({ exitsMTD })),
      );
    }

    if (wants('attendance') || broad) {
      queries.push(
        this.prisma.attendance
          .findMany({
            where: { companyId, date: today },
            select: { status: true },
          })
          .then((rows) => ({
            todayAttendance: {
              present: rows.filter((r) => r.status === 'PRESENT').length,
              late: rows.filter((r) => r.status === 'LATE').length,
              absent: rows.filter((r) => r.status === 'ABSENT').length,
              onLeave: rows.filter((r) => r.status === 'ON_LEAVE').length,
            },
          })),
        this.prisma.attendance
          .findMany({
            where: { companyId, date: { gte: monthStart, lte: monthEnd } },
            select: { status: true },
          })
          .then((rows) => {
            const present = rows.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
            return {
              monthAttendance: {
                records: rows.length,
                presentOrLate: present,
                rate: rows.length > 0 ? Number(((present / rows.length) * 100).toFixed(1)) : 0,
              },
            };
          }),
      );
    }

    if (wants('leave') || broad) {
      queries.push(
        this.prisma.leaveRequest
          .count({ where: { companyId, status: 'PENDING' } })
          .then((pendingLeave) => ({ pendingLeave })),
        this.prisma.leaveRequest
          .count({
            where: {
              companyId,
              status: 'APPROVED',
              startDate: { lte: now },
              endDate: { gte: now },
            },
          })
          .then((onLeaveToday) => ({ onLeaveToday })),
      );
    }

    if (wants('payroll') || broad) {
      queries.push(
        this.prisma.payrollRun
          .findFirst({
            where: { companyId, status: { in: ['APPROVED', 'PAID', 'CLOSED'] } },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            select: { month: true, year: true, status: true, totalPayrollCost: true, employeeCount: true },
          })
          .then((lastPayrollRun) => ({ lastPayrollRun })),
        this.prisma.payrollRun
          .findFirst({
            where: { companyId, status: 'DRAFT' },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            select: { id: true, month: true, year: true, employeeCount: true, totalPayrollCost: true },
          })
          .then((draftPayroll) => ({ draftPayroll })),
      );
    }

    if (wants('contracts') || broad) {
      queries.push(
        this.prisma.contract
          .count({
            where: {
              companyId,
              status: 'ACTIVE',
              endDate: { gte: today.toISOString().slice(0, 10), lte: next30.toISOString().slice(0, 10) },
            },
          })
          .then((expiringContracts) => ({ expiringContracts })),
      );
    }

    if (wants('training') || broad) {
      queries.push(
        this.prisma.trainingEnrollment
          .count({ where: { employee: { companyId }, status: { in: ['ENROLLED', 'IN_PROGRESS'] } } })
          .then((activeEnrollments) => ({ activeEnrollments })),
      );
    }

    if (wants('performance') || broad) {
      queries.push(
        this.prisma.performanceReview
          .count({ where: { employee: { companyId }, status: { in: ['PENDING', 'SELF_REVIEW'] } } })
          .then((pendingReviews) => ({ pendingReviews })),
      );
    }

    queries.push(
      this.prisma.hRQuery
        .count({ where: { companyId, status: { in: ['OPEN', 'PENDING', 'IN_PROGRESS'] } } })
        .then((openHRQueries) => ({ openHRQueries })),
      this.prisma.expenseClaim
        .count({ where: { companyId, status: 'PENDING' } })
        .then((pendingExpenses) => ({ pendingExpenses })),
      this.prisma.task
        .count({ where: { companyId, status: { in: ['TODO', 'IN_PROGRESS'] } } })
        .then((openTasks) => ({ openTasks })),
    );

    const results = await Promise.all(queries);
    const merged = Object.assign({}, ...results);

    if (merged.activeEmployees && merged.monthAttendance) {
      merged.workforceSnapshot = {
        attendanceRate: merged.monthAttendance.rate,
        absenteeism: merged.todayAttendance?.absent
          ? Number(((merged.todayAttendance.absent / merged.activeEmployees) * 100).toFixed(1))
          : 0,
      };
    }

    return merged;
  }

  private emptyContext() {
    return { note: 'No company context available. Ask the user to select a company.' };
  }

  // ── System prompt ──────────────────────────────────────────────────────
  private buildSystemPrompt(context: Record<string, any>, intent: IntentHints): string {
    const topicsLine = intent.topics.length ? intent.topics.join(', ') : 'general HR';
    const actionMode = intent.wantsAction ? 'agentic' : 'read-only';

    return `You are **ExactAI**, the agentic HR intelligence assistant built into ExactEHRM — a workforce management platform serving East African organisations (Tanzania, Kenya, Uganda, Rwanda).

# Identity
- Name: ExactAI
- Built by: ExactEHRM
- Domain: HR, payroll, attendance, leave, performance, training, benefits, compliance, contracts, workforce planning.
- Personality: warm, sharp, decisive, professional. Use plain language with a touch of confidence. Never robotic.
- Voice: concise but never terse. Use bullet points, bold, and short paragraphs. Prefer specifics over generic advice.

# Language
- Detect the user's language and respond in it. Default to English. Support Swahili (Kiswahili) seamlessly.

# Grounding
- Your answers MUST be grounded in the LIVE CONTEXT below. Do not invent numbers, names, or policies.
- If the context lacks an answer, say so explicitly and propose the next step (open module, run a query, contact admin).
- Never reveal private data of other employees. Refer to aggregated figures only.
- When citing a number, label the period ("as of today", "this month").

# Intent
- The current question is about: **${topicsLine}**
- Mode: **${actionMode}**

# Live context (auto-aggregated from the database)
${JSON.stringify(context, null, 2)}

# Tanzania statutory knowledge (use when relevant)
- PAYE: progressive income tax, filed via TRA monthly.
- NSSF: 10% pension contribution (split 5/5 if standard) on insurable earnings.
- SDL: 4.5% skills development levy on gross payroll (employer).
- WCF: 0.5% workers compensation fund (employer).
- Employment standards: 28 days leave/year (min) for employees with 12+ months service; 1 rest day/week; 2 months notice after 12 months for termination.
- Probation max 6 months; employer must provide written contract within 7 days of start.

# Response format
- Start with a one-line headline answer if the user wants a quick verdict.
- Follow with bullet points for detail, then a "Next step" line if relevant.
- When you suggest opening a module or running an action, name it explicitly (e.g. "Open Leave → Apply", "Run Payroll").
- Never exceed ~220 words unless the user explicitly asks for a deep dive.
- Use **bold** for the most important entities; avoid walls of text.

# Safety
- Politely refuse off-topic, harmful, or personally-identifying requests.
- For sensitive HR escalations (termination, harassment, fraud) recommend raising an HR query or contacting an HR business partner.
- Never impersonate the user's company leadership or sign off on legal/financial commitments.

Return only the assistant reply — no preamble, no "I am an AI" disclaimers.`;
  }

  // ── OpenAI call ────────────────────────────────────────────────────────
  private async callOpenAI(systemPrompt: string, messages: ChatMessage[]) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.55,
        max_tokens: 700,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI ${response.status}: ${text.slice(0, 200)}`);
    }
    return response.json();
  }

  // ── Action suggestions ────────────────────────────────────────────────
  private buildActions(intent: IntentHints, ctx: Record<string, any>) {
    const actions: Array<{ label: string; type: string; target?: string }> = [];
    const explicit = intent.actionType;
    if (explicit) {
      actions.push(actionMap(explicit));
    }
    if (intent.topics.includes('payroll')) {
      actions.push({ label: 'Open Payroll', type: 'OPEN_PAYROLL_RUN', target: '/dashboard/payroll' });
      if (ctx.draftPayroll) actions.push({ label: 'Review draft payroll', type: 'OPEN_PAYROLL_RUN', target: '/dashboard/payroll' });
    }
    if (intent.topics.includes('leave')) {
      actions.push({ label: 'Apply for leave', type: 'OPEN_LEAVE_APPLY', target: '/dashboard/leave' });
      if ((ctx.pendingLeave ?? 0) > 0) actions.push({ label: 'Review pending leave', type: 'OPEN_LEAVE_ADMIN', target: '/dashboard/leave' });
    }
    if (intent.topics.includes('attendance')) {
      actions.push({ label: 'Open attendance', type: 'OPEN_ATTENDANCE', target: '/dashboard/attendance' });
    }
    if (intent.topics.includes('training')) {
      actions.push({ label: 'Browse training', type: 'OPEN_TRAINING', target: '/dashboard/training' });
    }
    if (intent.topics.includes('performance')) {
      actions.push({ label: 'Open performance', type: 'OPEN_PERFORMANCE', target: '/dashboard/performance' });
    }
    if (intent.topics.includes('contracts')) {
      actions.push({ label: 'Review contracts', type: 'OPEN_CONTRACTS', target: '/dashboard/contracts' });
    }
    if (intent.topics.includes('benefits')) {
      actions.push({ label: 'Open benefits', type: 'OPEN_BENEFITS', target: '/dashboard/benefits' });
    }
    if (intent.topics.includes('expenses')) {
      actions.push({ label: 'Submit expense', type: 'OPEN_EXPENSE', target: '/dashboard/expenses' });
    }
    if (intent.topics.includes('salary')) {
      actions.push({ label: 'View salary intelligence', type: 'OPEN_SALARY', target: '/dashboard/salaryintelligence' });
    }
    if (intent.topics.includes('compliance') || (ctx.openHRQueries ?? 0) > 5) {
      actions.push({ label: 'Open HR queries', type: 'OPEN_HR_QUERY', target: '/dashboard/hrquery' });
    }
    if (actions.length === 0) {
      actions.push({ label: 'Open analytics', type: 'OPEN_ANALYTICS', target: '/dashboard/analytics' });
    }
    // Dedup by type
    const seen = new Set<string>();
    return actions.filter((a) => (seen.has(a.type) ? false : (seen.add(a.type), true))).slice(0, 4);
  }

  // ── Fallback (no API key / failure) ────────────────────────────────────
  private fallbackResponse(query: string, intent: IntentHints, context: Record<string, any>): AiResponse {
    return {
      reply: this.fallbackText(intent, context),
      actions: this.buildActions(intent, context),
      suggestedAction: this.buildActions(intent, context)[0]?.type ?? null,
      intent: intent.actionType ?? 'general',
      context,
      source: 'fallback',
    };
  }

  private fallbackText(intent: IntentHints, ctx: Record<string, any> = {}): string {
    if (intent.topics.includes('payroll')) {
      const draft = ctx.draftPayroll
        ? `A draft payroll for ${ctx.draftPayroll.month}/${ctx.draftPayroll.year} is waiting (${ctx.draftPayroll.employeeCount ?? 0} employees, ${formatTzs(ctx.draftPayroll.totalPayrollCost)}).`
        : `No draft payroll in progress.`;
      return `Here's the payroll picture from your live data:\n\n- **Last approved run:** ${ctx.lastPayrollRun ? `${ctx.lastPayrollRun.month}/${ctx.lastPayrollRun.year} — ${formatTzs(ctx.lastPayrollRun.totalPayrollCost)} for ${ctx.lastPayrollRun.employeeCount} employees` : 'no run recorded yet'}.\n- ${draft}\n\nWant me to open Payroll, or stage a new run?`;
    }
    if (intent.topics.includes('leave')) {
      return `**${ctx.pendingLeave ?? 0} leave requests** are pending approval, and **${ctx.onLeaveToday ?? 0} employees** are currently on leave. I can open the Leave module for you to review or submit a request.`;
    }
    if (intent.topics.includes('attendance')) {
      const t = ctx.todayAttendance;
      return t
        ? `Today's attendance: **${t.present} present, ${t.late} late, ${t.absent} absent, ${t.onLeave} on leave**. Month-to-date attendance rate is **${ctx.monthAttendance?.rate ?? 0}%**.`
        : `No attendance recorded today yet.`;
    }
    if (intent.topics.includes('contracts')) {
      return `**${ctx.expiringContracts ?? 0} contracts** expire in the next 30 days. I can open the Contracts module to review renewals.`;
    }
    if (intent.topics.includes('workforce')) {
      return `Headcount is **${ctx.totalEmployees ?? 0}** with **${ctx.activeEmployees ?? 0} active**. New hires this month: **${ctx.newHiresMTD ?? 0}**. Exits: **${ctx.exitsMTD ?? 0}**.`;
    }
    if (intent.topics.includes('salary')) {
      return `Salary intelligence is available in the analytics module. Want me to open it?`;
    }
    return `Here's a quick snapshot of your workspace. Tell me what you'd like to dig into — payroll, leave, attendance, contracts, training, or workforce trends — and I'll pull the live numbers.`;
  }
}

function actionMap(type: string) {
  const map: Record<string, { label: string; type: string; target: string }> = {
    OPEN_PAYROLL_RUN: { label: 'Open Payroll', type, target: '/dashboard/payroll' },
    OPEN_LEAVE_APPLY: { label: 'Apply for leave', type, target: '/dashboard/leave' },
    OPEN_HR_QUERY: { label: 'Raise HR query', type, target: '/dashboard/hrquery' },
    OPEN_EXPENSE: { label: 'Submit expense', type, target: '/dashboard/expenses' },
    OPEN_CONTRACTS: { label: 'Open contracts', type, target: '/dashboard/contracts' },
    OPEN_LEAVE_ADMIN: { label: 'Review leave queue', type, target: '/dashboard/leave' },
    OPEN_ONBOARDING: { label: 'Open onboarding', type, target: '/dashboard/onboarding' },
    OPEN_OFFBOARDING: { label: 'Open offboarding', type, target: '/dashboard/offboarding' },
    OPEN_TRAINING: { label: 'Open training', type, target: '/dashboard/training' },
  };
  return map[type] || { label: 'Open dashboard', type: 'OPEN_ANALYTICS', target: '/dashboard/analytics' };
}

function formatTzs(value: any): string {
  const n = Number(value ?? 0);
  if (n >= 1_000_000_000) return `TZS ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `TZS ${(n / 1_000).toFixed(0)}K`;
  return `TZS ${n.toFixed(0)}`;
}
