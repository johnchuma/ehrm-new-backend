import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { SmsService } from '../notifications/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
          },
        },
      },
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

    const roles = user.roles.map((ur) => ({
      roleId: ur.role.id,
      roleName: ur.role.name,
      scope: ur.role.scope,
      companyId: ur.role.companyId,
    }));

    const permissions: string[] = Array.from(
      new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name))),
    );

    const isSuperAdmin = user.roles.some((ur) => ur.role.scope === 'GLOBAL' && ur.role.name === 'HRM_SUPER_ADMIN');

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email ?? '',
      roles,
      permissions,
      selectedCompanyId: user.companyId ?? undefined,
      isSuperAdmin,
      isImpersonating: false,
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
    const tokens = await this.generateTokens({ sub: user.id, email: user.email ?? '', roles: [], permissions: [], isSuperAdmin: false, isImpersonating: false });
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
    const tokens = await this.generateTokens({ sub: user.id, email: user.email ?? '', roles: [], permissions: [], isSuperAdmin: false, isImpersonating: false });
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

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Account inactive');

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const roles = user.roles.map((ur) => ({ roleId: ur.role.id, roleName: ur.role.name, scope: ur.role.scope, companyId: ur.role.companyId }));
    const permissions: string[] = Array.from(new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name))));
    const isSuperAdmin = user.roles.some((ur) => ur.role.scope === 'GLOBAL' && ur.role.name === 'HRM_SUPER_ADMIN');

    return this.generateTokens({ sub: user.id, email: user.email ?? '', roles, permissions, selectedCompanyId: user.companyId ?? undefined, isSuperAdmin, isImpersonating: false });
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
    return { message: 'Logged out successfully' };
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
  }) {
    const jti = randomUUID();
    const refreshJti = randomUUID();

    const accessToken = this.jwt.sign({ ...payload, type: 'access', jti }, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign({ sub: payload.sub, email: payload.email, type: 'refresh', jti: refreshJti }, { expiresIn: '7d' });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { userId: payload.sub, token: refreshToken, jti: refreshJti, expiresAt, revoked: false },
    });

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
