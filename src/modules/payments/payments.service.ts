import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SnipepayService, SnipepayWebhookPayload } from './snipepay.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly snipepay: SnipepayService,
  ) {}

  // ─── PUBLIC ──────────────────────────────────────────────────────────────────

  async getPlans() {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true, isPublic: true },
      orderBy: { monthlyPrice: 'asc' },
    });
    return plans.map((p) => ({
      ...p,
      monthlyPrice: Number(p.monthlyPrice),
      annualPrice: Number(p.annualPrice),
      features: p.features ? JSON.parse(p.features) : {},
    }));
  }

  // ─── INITIATE PAYMENT ─────────────────────────────────────────────────────

  async initiatePayment(
    companyId: string,
    dto: {
      planSlug: string;
      billingInterval: string;
      callbackUrl: string;
      customerEmail?: string;
      customerName?: string;
    },
  ) {
    const [company, plan] = await Promise.all([
      this.prisma.company.findFirst({ where: { id: companyId, deletedAt: null } }),
      this.prisma.plan.findUnique({ where: { slug: dto.planSlug } }),
    ]);

    if (!company) throw new NotFoundException('Company not found');
    if (!plan) throw new NotFoundException('Plan not found');

    const isAnnual = dto.billingInterval === 'ANNUAL';
    const amount = isAnnual ? Number(plan.annualPrice) || Number(plan.monthlyPrice) * 10 : Number(plan.monthlyPrice);

    if (amount <= 0) throw new BadRequestException('Plan has no price configured');

    const reference = `EHRM-${companyId.slice(-6).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    const payment = await this.prisma.payment.create({
      data: {
        companyId,
        planId: plan.id,
        amount,
        currency: 'TZS',
        billingInterval: dto.billingInterval,
        status: 'PENDING',
        callbackUrl: dto.callbackUrl,
      },
    });

    const gatewayResponse = await this.snipepay.initiatePayment({
      amount,
      currency: 'TZS',
      reference,
      description: `${plan.name} — ${dto.billingInterval} subscription`,
      callbackUrl: `${process.env.API_BASE_URL || 'https://api.exactehrm.co.tz'}/api/v1/payments/webhook`,
      customerEmail: dto.customerEmail ?? company.email,
      customerName: dto.customerName ?? company.name,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayRef: gatewayResponse.transactionRef },
    });

    this.logger.log(`Payment initiated: ${payment.id} ref=${reference} company=${companyId}`);

    return {
      paymentId: payment.id,
      paymentUrl: gatewayResponse.paymentUrl,
      transactionRef: gatewayResponse.transactionRef,
      amount,
      currency: 'TZS',
      plan: { name: plan.name, slug: plan.slug },
      expiresAt: gatewayResponse.expiresAt,
    };
  }

  // ─── WEBHOOK ─────────────────────────────────────────────────────────────

  async handleWebhook(payload: SnipepayWebhookPayload) {
    if (!this.snipepay.verifyWebhookSignature(payload)) {
      this.logger.warn('Invalid webhook signature received');
      return { received: false };
    }

    const payment = await this.prisma.payment.findUnique({
      where: { gatewayRef: payload.transactionRef },
      include: { plan: true },
    });

    if (!payment) {
      this.logger.warn(`Webhook for unknown ref: ${payload.transactionRef}`);
      return { received: true };
    }

    if (payment.status !== 'PENDING') {
      return { received: true };
    }

    if (payload.status === 'SUCCESS') {
      const now = new Date();
      const periodEnd = new Date(now);
      if (payment.billingInterval === 'ANNUAL') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const existingSub = await this.prisma.subscription.findFirst({
        where: { companyId: payment.companyId },
      });

      let subscription: any;
      if (existingSub) {
        subscription = await this.prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            planId: payment.planId,
            status: 'ACTIVE',
            billingInterval: payment.billingInterval,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            gatewayRef: payload.transactionRef,
          },
        });
      } else {
        subscription = await this.prisma.subscription.create({
          data: {
            companyId: payment.companyId,
            planId: payment.planId,
            status: 'ACTIVE',
            billingInterval: payment.billingInterval,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            gatewayRef: payload.transactionRef,
          },
        });
      }

      await Promise.all([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            subscriptionId: subscription.id,
            gatewayResponse: JSON.stringify(payload),
            paidAt: payload.paidAt ? new Date(payload.paidAt) : now,
          },
        }),
        this.prisma.company.update({
          where: { id: payment.companyId },
          data: { subscriptionPlan: payment.plan.slug },
        }),
      ]);

      this.logger.log(`Payment completed: ${payment.id} → subscription ${subscription.id}`);
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          gatewayResponse: JSON.stringify(payload),
          failedAt: new Date(),
          failureReason: payload.failureReason ?? 'Payment declined',
        },
      });

      this.logger.warn(`Payment failed: ${payment.id} reason=${payload.failureReason}`);
    }

    return { received: true };
  }

  // ─── PAYMENT STATUS CHECK ─────────────────────────────────────────────────

  async getPaymentStatus(paymentId: string, companyId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, companyId },
      include: { plan: { select: { name: true, slug: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    // Sync status with gateway if still pending
    if (payment.status === 'PENDING' && payment.gatewayRef) {
      try {
        const live = await this.snipepay.checkStatus(payment.gatewayRef);
        if (live.status === 'SUCCESS' && payment.status === 'PENDING') {
          await this.handleWebhook({
            event: 'payment.success',
            transactionRef: payment.gatewayRef,
            reference: payment.gatewayRef,
            status: 'SUCCESS',
            amount: Number(payment.amount),
            currency: payment.currency,
            paidAt: live.paidAt,
            signature: '',
          });
          return this.getPaymentStatus(paymentId, companyId);
        }
      } catch {
        // best-effort sync
      }
    }

    return {
      id: payment.id,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      billingInterval: payment.billingInterval,
      plan: payment.plan,
      paidAt: payment.paidAt,
      failureReason: payment.failureReason,
      createdAt: payment.createdAt,
    };
  }

  // ─── COMPANY PAYMENT HISTORY ──────────────────────────────────────────────

  async getCompanyPaymentHistory(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where: { companyId } }),
      this.prisma.payment.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: { select: { name: true, slug: true } },
          subscription: { select: { id: true, status: true, currentPeriodEnd: true } },
        },
      }),
    ]);

    return {
      data: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
      },
    };
  }

  // ─── SUPER ADMIN ─────────────────────────────────────────────────────────

  async getAllPayments(page = 1, limit = 20, status?: string, companyId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;

    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: { select: { name: true, slug: true } },
          company: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      data: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
      },
    };
  }

  async getPaymentStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue,
      completedCount,
      failedCount,
      pendingCount,
      recentPayments,
      revenueByMonth,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED', paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED', paidAt: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { paidAt: 'desc' },
        take: 10,
        include: {
          company: { select: { id: true, name: true } },
          plan: { select: { name: true } },
        },
      }),
      this.prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
        SELECT
          DATE_FORMAT(paidAt, '%Y-%m') AS month,
          SUM(amount) AS revenue
        FROM payments
        WHERE status = 'COMPLETED'
          AND paidAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
      yearlyRevenue: Number(yearlyRevenue._sum.amount ?? 0),
      transactions: { completed: completedCount, failed: failedCount, pending: pendingCount },
      recentPayments: recentPayments.map((p) => ({ ...p, amount: Number(p.amount) })),
      revenueByMonth: revenueByMonth.map((r) => ({ month: r.month, revenue: Number(r.revenue) })),
    };
  }
}
