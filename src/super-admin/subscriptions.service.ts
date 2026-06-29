import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SubscriptionAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Plans ─────────────────────────────────────────────────────────────────────

  async getPlans() {
    const plans = await (this.prisma.plan as any).findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
      include: {
        _count: {
          select: {
            subscriptions: { where: { status: { notIn: ['CANCELLED'] } } },
          },
        },
      },
    });

    return plans.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      monthlyPrice: Number(p.monthlyPrice),
      annualPrice: Number(p.annualPrice),
      maxEmployees: p.maxEmployees,
      features: this.parseFeatures(p.features),
      isActive: p.isActive,
      isPublic: p.isPublic,
      isHighlighted: p.isHighlighted ?? false,
      supportTier: p.supportTier ?? 'Email',
      activeSubscriptions: p._count?.subscriptions ?? 0,
    }));
  }

  async updatePlan(
    planId: string,
    data: {
      monthlyPrice?: number;
      annualPrice?: number;
      features?: string[];
      isHighlighted?: boolean;
      supportTier?: string;
      maxEmployees?: number;
      description?: string;
    },
  ) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const updateData: any = {};
    if (data.monthlyPrice !== undefined) updateData.monthlyPrice = data.monthlyPrice;
    if (data.annualPrice !== undefined) updateData.annualPrice = data.annualPrice;
    if (data.features !== undefined) updateData.features = JSON.stringify(data.features);
    if (data.isHighlighted !== undefined) updateData.isHighlighted = data.isHighlighted;
    if (data.supportTier !== undefined) updateData.supportTier = data.supportTier;
    if (data.maxEmployees !== undefined) updateData.maxEmployees = data.maxEmployees;
    if (data.description !== undefined) updateData.description = data.description;

    const updated = await (this.prisma.plan as any).update({ where: { id: planId }, data: updateData });
    return { ...updated, features: this.parseFeatures(updated.features) };
  }

  async createPlan(data: {
    name: string;
    slug: string;
    monthlyPrice: number;
    annualPrice?: number;
    maxEmployees?: number;
    features?: string[];
    description?: string;
    supportTier?: string;
    isHighlighted?: boolean;
    isPublic?: boolean;
  }) {
    const existing = await this.prisma.plan.findFirst({
      where: { OR: [{ name: data.name }, { slug: data.slug }] },
    });
    if (existing) {
      throw new Error(`A plan with this name or slug already exists`);
    }

    const created = await (this.prisma.plan as any).create({
      data: {
        name: data.name,
        slug: data.slug,
        monthlyPrice: data.monthlyPrice,
        annualPrice: data.annualPrice ?? 0,
        maxEmployees: data.maxEmployees ?? -1,
        features: data.features ? JSON.stringify(data.features) : null,
        description: data.description ?? null,
        supportTier: data.supportTier ?? 'Email',
        isHighlighted: data.isHighlighted ?? false,
        isPublic: data.isPublic ?? true,
        isActive: true,
      },
    });

    return { ...created, features: this.parseFeatures(created.features) };
  }

  async deletePlan(planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const activeSubCount = await this.prisma.subscription.count({
      where: { planId, status: { notIn: ['CANCELLED'] } },
    });
    if (activeSubCount > 0) {
      throw new Error(
        `Cannot delete plan — ${activeSubCount} active subscription(s) are using it. Migrate them first.`,
      );
    }

    // Soft-delete by setting isActive = false rather than hard-deleting
    await (this.prisma.plan as any).update({ where: { id: planId }, data: { isActive: false } });
    return { message: `Plan "${plan.name}" deactivated` };
  }

  // ── Overview KPIs ─────────────────────────────────────────────────────────────

  async getOverview() {
    const [totalCompanies, activePlans, subscriptions] = await Promise.all([
      this.prisma.company.count({ where: { deletedAt: null } }),
      this.prisma.plan.count({ where: { isActive: true } }),
      (this.prisma.subscription as any).findMany({
        where: { status: { notIn: ['CANCELLED'] } },
        include: { plan: { select: { monthlyPrice: true, annualPrice: true, name: true } } },
      }),
    ]);

    const activeSubs = subscriptions.filter((s: any) => s.status === 'ACTIVE').length;
    const trialSubs = subscriptions.filter((s: any) => s.status === 'TRIAL').length;
    const pastDue = subscriptions.filter((s: any) => s.status === 'PAST_DUE').length;

    let totalMRR = 0;
    const planMRR: Record<string, number> = {};
    for (const sub of subscriptions) {
      if (sub.status === 'ACTIVE' || sub.status === 'TRIAL') {
        const monthly =
          sub.billingInterval === 'ANNUAL'
            ? Math.round(Number(sub.plan.annualPrice) / 12)
            : Number(sub.plan.monthlyPrice);
        totalMRR += monthly;
        planMRR[sub.plan.name] = (planMRR[sub.plan.name] ?? 0) + monthly;
      }
    }

    const planBreakdown = Object.entries(planMRR).map(([plan, mrr]) => ({
      plan,
      count: subscriptions.filter((s: any) => s.plan.name === plan && s.status !== 'CANCELLED').length,
      mrr,
    }));

    return { totalCompanies, activePlans, activeSubs, trialSubs, pastDue, totalMRR, planBreakdown };
  }

  // ── Company Subscriptions List ────────────────────────────────────────────────

  async getCompanySubscriptions(page = 1, limit = 20, search?: string, status?: string, planSlug?: string) {
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
    }
    if (status && status !== 'All') {
      where.status = status.toUpperCase();
    }

    const [total, companies] = await Promise.all([
      this.prisma.company.count({ where }),
      (this.prisma.company as any).findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            where: { status: { notIn: ['CANCELLED'] } },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { plan: true },
          },
          _count: { select: { employees: { where: { status: 'ACTIVE' } } } },
        },
      }),
    ]);

    const data = companies.map((company: any) => {
      const sub: any = company.subscriptions[0] ?? null;
      const plan: any = sub?.plan ?? null;

      const employeeCount: number = company._count?.employees ?? 0;
      const maxUsers: number | null =
        company.userLimit ?? (plan ? (plan.maxEmployees === -1 ? null : plan.maxEmployees) : null);

      let mrr = 0;
      if (plan && sub) {
        mrr =
          sub.billingInterval === 'ANNUAL'
            ? Math.round(Number(plan.annualPrice) / 12)
            : Number(plan.monthlyPrice);
      }

      const statusLabel = (() => {
        if (company.status === 'SUSPENDED') return 'Suspended';
        if (!sub) return 'No Plan';
        if (sub.status === 'TRIAL') return 'Trial';
        if (sub.status === 'PAST_DUE') return 'Past Due';
        if (sub.status === 'ACTIVE') return 'Active';
        return sub.status;
      })();

      let enabledModules: string[] = [];
      if (company.enabledModules) {
        try { enabledModules = JSON.parse(company.enabledModules); } catch {}
      }

      return {
        id: company.id,
        company: company.name,
        plan: plan?.name ?? company.subscriptionPlan ?? 'No Plan',
        planId: plan?.id ?? null,
        planSlug: plan?.slug ?? null,
        subscriptionId: sub?.id ?? null,
        users: employeeCount,
        maxUsers,
        billingCycle: sub?.billingInterval === 'ANNUAL' ? 'Annual' : 'Monthly',
        nextBilling: sub?.currentPeriodEnd?.toISOString() ?? null,
        mrr,
        status: statusLabel,
        modulesEnabled: enabledModules,
        contractEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
        trialEndsAt: sub?.trialEndsAt?.toISOString() ?? null,
      };
    });

    const filtered = planSlug ? data.filter((d: any) => d.planSlug === planSlug) : data;

    return {
      data: filtered,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
      },
    };
  }

  // ── Usage Stats ───────────────────────────────────────────────────────────────

  async getUsageStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const ALL_MODULES = [
      'Attendance', 'Leave', 'Payroll', 'CTC', 'Training', 'Performance', 'Compliance', 'ExactAI',
    ];

    const [totalCompanies, totalEmployees, apiCallsMTD, companiesWithModules] = await Promise.all([
      this.prisma.company.count({ where: { deletedAt: null } }),
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.auditLog.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.company.findMany({
        where: { deletedAt: null },
        select: { enabledModules: true },
      }),
    ]);

    const moduleAdoption = ALL_MODULES.map((mod) => {
      let count = 0;
      for (const c of companiesWithModules) {
        if (!c.enabledModules) continue;
        try {
          const mods: string[] = JSON.parse(c.enabledModules);
          if (mods.includes(mod)) count++;
        } catch {}
      }
      const adoptionPct = totalCompanies > 0 ? Math.round((count / totalCompanies) * 100) : 0;
      return { module: mod, count, adoptionPct };
    });

    return { totalCompanies, totalEmployees, apiCallsMTD, moduleAdoption };
  }

  // ── Set Company User Limit ────────────────────────────────────────────────────

  async setCompanyLimit(companyId: string, userLimit: number | null) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');
    await (this.prisma.company as any).update({ where: { id: companyId }, data: { userLimit } });
    return { message: 'User limit updated', userLimit };
  }

  // ── Set Company Modules ───────────────────────────────────────────────────────

  async setCompanyModules(companyId: string, modules: string[]) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');
    await (this.prisma.company as any).update({
      where: { id: companyId },
      data: { enabledModules: JSON.stringify(modules) },
    });
    return { message: 'Modules updated', enabledModules: modules };
  }

  // ── Extend Trial ──────────────────────────────────────────────────────────────

  async extendTrial(companyId: string, days: number) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');

    const sub = await this.prisma.subscription.findFirst({
      where: { companyId, status: 'TRIAL' },
      orderBy: { createdAt: 'desc' },
    });
    if (!sub) throw new NotFoundException('No active trial subscription found for this company');

    const base = (sub as any).trialEndsAt ?? sub.currentPeriodEnd;
    const newEnd = new Date(base);
    newEnd.setDate(newEnd.getDate() + days);

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { trialEndsAt: newEnd, currentPeriodEnd: newEnd } as any,
    });

    return { message: `Trial extended by ${days} day(s)`, newTrialEnd: newEnd.toISOString() };
  }

  // ── Billing Alerts ────────────────────────────────────────────────────────────

  async syncBillingAlerts() {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 86400000);
    const in14Days = new Date(now.getTime() + 14 * 86400000);
    const ago90Days = new Date(now.getTime() - 90 * 86400000);

    // Trial expiring within 7 days
    const expiringTrials = await (this.prisma.subscription as any).findMany({
      where: { status: 'TRIAL', trialEndsAt: { gte: now, lte: in7Days } },
    });
    for (const sub of expiringTrials) {
      const exists = await (this.prisma.billingAlert as any).findFirst({
        where: { type: 'Trial Expiring', companyId: sub.companyId, resolved: false },
      });
      if (!exists) {
        const daysLeft = Math.ceil((new Date(sub.trialEndsAt).getTime() - now.getTime()) / 86400000);
        await (this.prisma.billingAlert as any).create({
          data: {
            type: 'Trial Expiring',
            companyId: sub.companyId,
            message: `Trial period ends in ${daysLeft} day(s) on ${new Date(sub.trialEndsAt).toISOString().split('T')[0]}. No payment method confirmed yet.`,
            severity: 'High',
          },
        });
      }
    }

    // Annual contracts renewing within 14 days
    const renewingSubs = await (this.prisma.subscription as any).findMany({
      where: { status: 'ACTIVE', billingInterval: 'ANNUAL', currentPeriodEnd: { gte: now, lte: in14Days } },
    });
    for (const sub of renewingSubs) {
      const exists = await (this.prisma.billingAlert as any).findFirst({
        where: { type: 'Contract Renewing', companyId: sub.companyId, resolved: false },
      });
      if (!exists) {
        await (this.prisma.billingAlert as any).create({
          data: {
            type: 'Contract Renewing',
            companyId: sub.companyId,
            message: `Annual contract renews on ${new Date(sub.currentPeriodEnd).toISOString().split('T')[0]}. Send renewal quote at least 30 days in advance.`,
            severity: 'Medium',
          },
        });
      }
    }

    // Past due subscriptions
    const pastDue = await (this.prisma.subscription as any).findMany({
      where: { status: 'PAST_DUE' },
    });
    for (const sub of pastDue) {
      const exists = await (this.prisma.billingAlert as any).findFirst({
        where: { type: 'Payment Failed', companyId: sub.companyId, resolved: false },
      });
      if (!exists) {
        await (this.prisma.billingAlert as any).create({
          data: {
            type: 'Payment Failed',
            companyId: sub.companyId,
            message: 'Subscription payment is past due. Account will be suspended if not resolved within 7 days.',
            severity: 'Critical',
          },
        });
      }
    }

    // Suspended companies 90+ days (churn risk)
    const churning = await (this.prisma.company as any).findMany({
      where: { status: 'SUSPENDED', deletedAt: null, updatedAt: { lte: ago90Days } },
      select: { id: true },
    });
    for (const company of churning) {
      const exists = await (this.prisma.billingAlert as any).findFirst({
        where: { type: 'Churn Risk', companyId: company.id, resolved: false },
      });
      if (!exists) {
        await (this.prisma.billingAlert as any).create({
          data: {
            type: 'Churn Risk',
            companyId: company.id,
            message: 'Account has been suspended for 90+ days with no payment or contact. High churn risk.',
            severity: 'Critical',
          },
        });
      }
    }
  }

  async getBillingAlerts(resolved?: boolean, page = 1, limit = 50) {
    await this.syncBillingAlerts();

    const skip = (page - 1) * limit;
    const where: any = {};
    if (resolved !== undefined) where.resolved = resolved;

    const [total, alerts] = await Promise.all([
      (this.prisma.billingAlert as any).count({ where }),
      (this.prisma.billingAlert as any).findMany({
        where,
        skip,
        take: limit,
        orderBy: { occurredAt: 'desc' },
        include: { company: { select: { id: true, name: true } } },
      }),
    ]);

    const data = alerts.map((a: any) => ({
      id: a.id,
      type: a.type,
      companyId: a.companyId,
      companyName: a.company?.name ?? '—',
      message: a.message,
      severity: a.severity,
      resolved: a.resolved,
      resolvedAt: a.resolvedAt,
      occurredAt: a.occurredAt,
    }));

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total },
    };
  }

  async resolveBillingAlert(alertId: string, resolvedBy: string) {
    const alert = await (this.prisma.billingAlert as any).findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException('Billing alert not found');
    return (this.prisma.billingAlert as any).update({
      where: { id: alertId },
      data: { resolved: true, resolvedAt: new Date(), resolvedBy },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private parseFeatures(features: string | null): string[] {
    if (!features) return [];
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) return parsed;
      return Object.entries(parsed).filter(([, v]) => v).map(([k]) => k);
    } catch {
      return [];
    }
  }
}
