import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { SmsService } from '../notifications/sms.service';
import {
  ALL_PERMISSION_NAMES,
  COMPANY_ADMIN_PERMISSIONS,
  groupPermissionsByResource,
  isCompanyAdminRole,
} from '../../common/rbac/company-admin.permissions';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
  ) {}

  /**
   * Defensive role matching: a super-admin must be recognised regardless of
   * stray casing or separator drift ("System Administrator", "system_administrator",
   * "system-admin", "System Admin"). A single bad casing must never silently
   * strip platform privileges.
   */
  private isSuperAdminRole(role?: string | null): boolean {
    if (!role) return false;
    const normalized = role.toLowerCase().replace(/[\s_-]+/g, ' ').trim();
    return normalized === 'system administrator' || normalized === 'system admin';
  }

  private isCompanyAdminRole(role?: string | null): boolean {
    return isCompanyAdminRole(role);
  }

  /**
   * Resolve a user's effective permission names: super admins get the full
   * catalog, company admins get the fixed Company-Admin set, and everyone else
   * gets exactly what their assigned roles grant.
   */
  async resolveUserPermissions(userId: string, role?: string | null): Promise<string[]> {
    if (this.isSuperAdminRole(role)) return [...ALL_PERMISSION_NAMES];

    const set = new Set<string>();
    if (this.isCompanyAdminRole(role)) {
      COMPANY_ADMIN_PERMISSIONS.forEach((p) => set.add(p));
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) set.add(rp.permission.name);
    }
    return [...set];
  }

  /** Effective permissions grouped by resource — powers the management nav. */
  async getEffectivePermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const permissions = await this.resolveUserPermissions(userId, user?.role);
    return {
      isSuperAdmin: this.isSuperAdminRole(user?.role),
      isCompanyAdmin: this.isCompanyAdminRole(user?.role),
      permissions,
      modules: groupPermissionsByResource(permissions),
    };
  }

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Invalid email or password');

    if (user.lockedUntil && user.lockedUntil > new Date())
      throw new UnauthorizedException('Account temporarily locked. Try again later.');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const attempts = user.failedAttempts + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await this.prisma.user.update({ where: { id: user.id }, data: { failedAttempts: attempts, lockedUntil } });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } });

    const isSuperAdmin = this.isSuperAdminRole(user.role);
    const permissions = await this.resolveUserPermissions(user.id, user.role);

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email ?? '',
      roles: [],
      permissions,
      selectedCompanyId: user.companyId ?? undefined,
      isSuperAdmin,
      isImpersonating: false,
      ip,
      userAgent,
    });

    const { password: _pw, mfaSecret: _mfa, ...safeUser } = user as any;
    return { ...tokens, user: safeUser };
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; companyId?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new UnauthorizedException('Email already exists');
    const hashed = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashed,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        companyId: data.companyId ?? undefined,
        isActive: true,
      },
    });
    const permissions = await this.resolveUserPermissions(user.id, user.role);
    const tokens = await this.generateTokens({ sub: user.id, email: user.email ?? '', roles: [], permissions, isSuperAdmin: false, isImpersonating: false });
    const { password: _pw, ...safeUser } = user as any;
    return { ...tokens, user: safeUser };
  }

  // ── Phone OTP Login ──

  async sendOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.phoneOtp.updateMany({ where: { phone, used: false }, data: { used: true } });
    await this.prisma.phoneOtp.create({ data: { phone, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) } });
    this.sms.send(phone, `Your ExactEHRM verification code is: ${otp}. It expires in 5 minutes.`).catch(() => {});
    return { message: 'OTP sent' };
  }

  async verifyOtp(phone: string, otp: string) {
    const record = await this.prisma.phoneOtp.findFirst({ where: { phone, otp, used: false, expiresAt: { gt: new Date() } } });
    if (!record) throw new BadRequestException('Invalid or expired OTP');
    await this.prisma.phoneOtp.update({ where: { id: record.id }, data: { used: true } });
    const user = await this.prisma.user.findFirst({ where: { phone } });
    if (!user) throw new UnauthorizedException('User not found with this phone number');
    const isSuperAdmin = this.isSuperAdminRole(user.role);
    const permissions = await this.resolveUserPermissions(user.id, user.role);
    const tokens = await this.generateTokens({ sub: user.id, email: user.email ?? '', roles: [], permissions, isSuperAdmin, isImpersonating: false });
    return { ...tokens, user };
  }

  // ── Forgot / Reset Password ──

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { message: 'If the email exists, a reset link has been sent.' };
    const token = this.jwt.sign({ sub: user.id, type: 'reset' }, { expiresIn: '1h' });
    await this.prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
    const resetUrl = `${process.env.FRONTEND_URL || 'https://test.exactehrm.co.tz'}/reset-password?token=${token}`;
    const bc = this.email.brandColor;
    this.email.send(email, 'Reset your ExactEHRM password', this.email.buildHtml(`
      <h2 style="color:${bc};margin:0 0 16px">Password Reset</h2>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${resetUrl}" style="display:inline-block;background:${bc};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Reset password</a>
      </p>
    `)).catch(() => {});
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = this.jwt.verify(token);
    if (!payload || payload.type !== 'reset') throw new BadRequestException('Invalid token');
    const reset = await this.prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expiresAt < new Date()) throw new BadRequestException('Invalid or expired token');
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } });
    await this.prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } });
    return { message: 'Password reset successful' };
  }

  async confirmEmail(token: string) {
    const payload = this.jwt.verify(token);
    if (!payload || payload.type !== 'email_confirm') throw new BadRequestException('Invalid token');
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified) return { message: 'Email already confirmed.' };
    await this.prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, isActive: true } });
    return { message: 'Email confirmed successfully. You can now sign in.' };
  }

  async resendConfirmation(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { message: 'If the email exists, a confirmation link has been sent.' };
    if (user.emailVerified) return { message: 'Email already confirmed.' };
    const confirmToken = this.jwt.sign({ sub: user.id, type: 'email_confirm' }, { expiresIn: '24h' });
    const confirmUrl = `${process.env.FRONTEND_URL || 'https://test.exactehrm.co.tz'}/confirm-email?token=${confirmToken}`;
    const bc = this.email.brandColor;
    this.email.send(email, 'Confirm your ExactEHRM account', this.email.buildHtml(`
      <h2 style="color:${bc};margin:0 0 16px">Email Confirmation</h2>
      <p>Hi ${user.firstName}, please confirm your email:</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${confirmUrl}" style="display:inline-block;background:${bc};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Confirm my account</a>
      </p>
    `)).catch(() => {});
    return { message: 'If the email exists, a confirmation link has been sent.' };
  }

  // ── Refresh & Logout ──

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type');

    const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revoked || stored.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token has been revoked or expired');

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('Account inactive');

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const isSuperAdmin = this.isSuperAdminRole(user.role);
    const permissions = await this.resolveUserPermissions(user.id, user.role);

    return this.generateTokens({ sub: user.id, email: user.email ?? '', roles: [], permissions, selectedCompanyId: user.companyId ?? undefined, isSuperAdmin, isImpersonating: false });
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
    return { message: 'Logged out successfully' };
  }

  async switchCompany(userId: string, companyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Account inactive');

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
      select: { id: true, name: true, email: true, subscriptionPlan: true, primaryColor: true, secondaryColor: true, logo: true, industry: true, size: true, country: true, currency: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    const sameOwner = String(company.email || '').toLowerCase().trim() === String(user.email || '').toLowerCase().trim();
    if (!sameOwner && !this.isSuperAdminRole(user.role)) {
      throw new ForbiddenException('You cannot switch to this company');
    }

    const isSuperAdmin = this.isSuperAdminRole(user.role);
    const permissions = await this.resolveUserPermissions(user.id, user.role);
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email ?? '',
      roles: [],
      permissions,
      selectedCompanyId: company.id,
      isSuperAdmin,
      isImpersonating: false,
    });

    const companies = await this.prisma.company.findMany({
      where: { email: String(user.email ?? '').trim().toLowerCase(), deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        industry: true,
        size: true,
        country: true,
        currency: true,
        subscriptionPlan: true,
        primaryColor: true,
        secondaryColor: true,
        logo: true,
      },
    });

    return {
      ...tokens,
      user: { ...user, companyId: company.id, selectedCompanyId: company.id },
      company,
      companies,
    };
  }

  // ── Token Generation ──

  async generateTokens(payload: {
    sub: string;
    email: string;
    roles?: any[];
    permissions?: string[];
    selectedCompanyId?: string;
    isSuperAdmin?: boolean;
    isImpersonating?: boolean;
    originalAdminId?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const jti = randomUUID();
    const refreshJti = randomUUID();

    const { ip, userAgent, ...jwtPayload } = payload;

    const accessToken = this.jwt.sign({ ...jwtPayload, type: 'access', jti }, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign({ sub: payload.sub, email: payload.email, type: 'refresh', jti: refreshJti }, { expiresIn: '7d' });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      // Clamp to the column widths (ipAddress VarChar(191), userAgent VarChar(500))
      // so an oversized header never triggers a P2000 "value too long" → 500.
      data: {
        userId: payload.sub,
        token: refreshToken,
        jti: refreshJti,
        expiresAt,
        revoked: false,
        ipAddress: ip ? ip.slice(0, 191) : null,
        userAgent: userAgent ? userAgent.slice(0, 500) : null,
      },
    });

    // Opportunistically prune this user's dead tokens so the table can't grow
    // unbounded (rows are otherwise only ever flagged revoked, never removed).
    // Bounded, indexed by userId, and best-effort — never fail token issuance.
    this.prisma.refreshToken
      .deleteMany({
        where: {
          userId: payload.sub,
          OR: [{ revoked: true }, { expiresAt: { lt: new Date() } }],
        },
      })
      .catch(() => {});

    return { accessToken, refreshToken };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwt.verify(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new Error('User not found');
      return { valid: true, user };
    } catch {
      return { valid: false, user: null };
    }
  }
}
