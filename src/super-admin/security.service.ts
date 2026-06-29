import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SecurityService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Overview ────────────────────────────────────────────────────────────────

  async getOverview() {
    const now = new Date();

    const [totalUsers, activeSessions, mfaEnabledCount, openAlerts, lockedAccounts] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.refreshToken.count({ where: { revoked: false, expiresAt: { gt: now } } }),
        this.prisma.user.count({ where: { mfaEnabled: true, deletedAt: null } }),
        this.prisma.securityAlert.count({ where: { resolved: false } }),
        this.prisma.user.count({ where: { lockedUntil: { gt: now }, deletedAt: null } }),
      ]);

    return { totalUsers, activeSessions, mfaEnabledCount, openAlerts, lockedAccounts };
  }

  // ── Users ───────────────────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, search?: string, role?: string) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = { deletedAt: null };
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          email: true,
          role: true,
          companyId: true,
          mfaEnabled: true,
          isActive: true,
          lastLoginAt: true,
          failedAttempts: true,
          lockedUntil: true,
          createdAt: true,
        },
      }),
    ]);

    const sessionCounts = await Promise.all(
      users.map((u) =>
        this.prisma.refreshToken.count({
          where: { userId: u.id, revoked: false, expiresAt: { gt: now } },
        }),
      ),
    );

    const data = users.map((u, i) => ({
      ...u,
      activeSessions: sessionCounts[i],
      isLocked: !!(u.lockedUntil && u.lockedUntil > now),
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
      },
    };
  }

  async forceMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
    return { message: 'MFA enabled for user' };
  }

  // ── Sessions ────────────────────────────────────────────────────────────────

  async getSessions(page = 1, limit = 20) {
    const now = new Date();
    const skip = (page - 1) * limit;
    const where = { revoked: false, expiresAt: { gt: now } };

    const [total, tokens] = await Promise.all([
      this.prisma.refreshToken.count({ where }),
      this.prisma.refreshToken.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, role: true } },
        },
      }),
    ]);

    const data = tokens.map((t) => ({
      sessionId: t.id,
      userId: t.userId,
      userName: t.user.fullName,
      email: t.user.email,
      role: t.user.role,
      ipAddress: (t as any).ipAddress ?? null,
      userAgent: (t as any).userAgent ?? null,
      startedAt: t.createdAt,
      expiresAt: t.expiresAt,
    }));

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total },
    };
  }

  async revokeSession(sessionId: string) {
    const token = await this.prisma.refreshToken.findUnique({ where: { id: sessionId } });
    if (!token) throw new NotFoundException('Session not found');
    await this.prisma.refreshToken.update({ where: { id: sessionId }, data: { revoked: true } });
    return { message: 'Session terminated' };
  }

  async revokeUserSessions(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    return { message: `${count} session(s) terminated` };
  }

  // ── Login Events ─────────────────────────────────────────────────────────────

  async getLoginEvents(page = 1, limit = 50, from?: string, to?: string) {
    const skip = (page - 1) * limit;

    const where: any = { action: { startsWith: 'auth.' } };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          action: true,
          ipAddress: true,
          userAgent: true,
          companyId: true,
          details: true,
          createdAt: true,
        },
      }),
    ]);

    const userIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))];
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds as string[] } },
          select: { id: true, email: true, fullName: true },
        })
      : [];
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const data = logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      userEmail: l.userId ? (userMap[l.userId]?.email ?? null) : null,
      userName: l.userId ? (userMap[l.userId]?.fullName ?? null) : null,
      action: l.action,
      status: l.action === 'auth.create' ? 'Success' : 'Event',
      ipAddress: l.ipAddress,
      userAgent: l.userAgent,
      companyId: l.companyId,
      occurredAt: l.createdAt,
    }));

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total },
    };
  }

  // ── Alerts ───────────────────────────────────────────────────────────────────

  async syncComputedAlerts() {
    const now = new Date();

    const [lockedUsers, highFailureUsers] = await Promise.all([
      this.prisma.user.findMany({
        where: { lockedUntil: { gt: now }, deletedAt: null },
        select: { id: true, email: true, fullName: true, failedAttempts: true },
      }),
      this.prisma.user.findMany({
        where: { failedAttempts: { gte: 3 }, lockedUntil: null, deletedAt: null },
        select: { id: true, email: true, fullName: true, failedAttempts: true },
      }),
    ]);

    for (const u of lockedUsers) {
      const key = `account_locked_${u.id}`;
      const exists = await this.prisma.securityAlert.findFirst({
        where: { type: 'Account Locked', entity: u.email ?? u.id, resolved: false },
      });
      if (!exists) {
        await this.prisma.securityAlert.create({
          data: {
            type: 'Account Locked',
            entity: u.email ?? u.id,
            detail: `Account locked after ${u.failedAttempts} failed login attempts`,
            severity: 'High',
          },
        });
      }
    }

    for (const u of highFailureUsers) {
      const exists = await this.prisma.securityAlert.findFirst({
        where: { type: 'Repeated Failed Logins', entity: u.email ?? u.id, resolved: false },
      });
      if (!exists) {
        await this.prisma.securityAlert.create({
          data: {
            type: 'Repeated Failed Logins',
            entity: u.email ?? u.id,
            detail: `${u.failedAttempts} consecutive failed login attempts detected`,
            severity: 'Medium',
          },
        });
      }
    }
  }

  async getAlerts(resolved?: boolean, page = 1, limit = 50) {
    await this.syncComputedAlerts();

    const skip = (page - 1) * limit;
    const where: any = {};
    if (resolved !== undefined) where.resolved = resolved;

    const [total, alerts] = await Promise.all([
      this.prisma.securityAlert.count({ where }),
      this.prisma.securityAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { occurredAt: 'desc' },
      }),
    ]);

    return {
      data: alerts,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: skip + limit < total },
    };
  }

  async resolveAlert(alertId: string, resolvedBy: string) {
    const alert = await this.prisma.securityAlert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException('Alert not found');
    return this.prisma.securityAlert.update({
      where: { id: alertId },
      data: { resolved: true, resolvedAt: new Date(), resolvedBy },
    });
  }
}
