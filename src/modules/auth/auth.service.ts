import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
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
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedException('Please confirm your email before signing in. Check your inbox or request a new confirmation link.');
    const tokens = this.generateTokens({ sub: user.id, email: user.email });
    return { ...tokens, user };
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
        companyId: data.companyId || '',
        isActive: true,
      },
    });
    const tokens = this.generateTokens({ sub: user.id, email: user.email });
    const bc = this.email.brandColor;
    this.email.send(data.email, 'Welcome to ExactEHRM', this.email.buildHtml(`
      <h2 style="color:${bc};margin:0 0 16px">Welcome to ExactEHRM!</h2>
      <p>Hi ${data.firstName}, your account has been created successfully. You can now log in and start managing your HR.</p>
    `)).catch(() => {});
    return { ...tokens, user };
  }

  // ── Phone OTP Login ──

  async sendOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Invalidate old OTPs
    await this.prisma.phoneOtp.updateMany({ where: { phone, used: false }, data: { used: true } });
    await this.prisma.phoneOtp.create({
      data: { phone, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
    });
    // Send OTP via SMS
    this.sms.send(phone, `Your ExactEHRM verification code is: ${otp}. It expires in 5 minutes.`).catch(() => {});
    return { message: 'OTP sent' };
  }

  async verifyOtp(phone: string, otp: string) {
    const record = await this.prisma.phoneOtp.findFirst({
      where: { phone, otp, used: false, expiresAt: { gt: new Date() } },
    });
    if (!record) throw new BadRequestException('Invalid or expired OTP');
    await this.prisma.phoneOtp.update({ where: { id: record.id }, data: { used: true } });
    const user = await this.prisma.user.findFirst({ where: { phone } });
    if (!user) throw new UnauthorizedException('User not found with this phone number');
    const tokens = this.generateTokens({ sub: user.id, email: user.email || '' });
    return { ...tokens, user };
  }

  // ── Forgot / Reset Password ──

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { message: 'If the email exists, a reset link has been sent.' };
    const token = this.jwt.sign({ sub: user.id, type: 'reset' }, { expiresIn: '1h' });
    await this.prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
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
    if (user.emailVerified) return { message: 'Email already confirmed. You can now sign in.' };
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, isActive: true },
    });
    const bc = this.email.brandColor;
    this.email.send(user.email, 'Welcome to ExactEHRM', this.email.buildHtml(`
      <h2 style="color:${bc};margin:0 0 16px">Welcome aboard!</h2>
      <p>Hi ${user.firstName}, your email has been confirmed. You can now sign in and start managing your HR.</p>
    `)).catch(() => {});
    return { message: 'Email confirmed successfully. You can now sign in.' };
  }

  async resendConfirmation(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { message: 'If the email exists, a confirmation link has been sent.' };
    if (user.emailVerified) return { message: 'Email already confirmed. You can sign in.' };
    const confirmToken = this.jwt.sign({ sub: user.id, type: 'email_confirm' }, { expiresIn: '24h' });
    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-email?token=${confirmToken}`;
    const bc = this.email.brandColor;
    this.email.send(email, 'Confirm your ExactEHRM account', this.email.buildHtml(`
      <h2 style="color:${bc};margin:0 0 16px">Email Confirmation</h2>
      <p>Hi ${user.firstName}, please confirm your email by clicking the button below:</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${confirmUrl}" style="display:inline-block;background:${bc};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Confirm my account</a>
      </p>
      <p style="color:#888;font-size:13px">This link expires in 24 hours.</p>
    `)).catch(() => {});
    return { message: 'If the email exists, a confirmation link has been sent.' };
  }

  generateTokens(payload: { sub: string; email: string }) {
    const accessToken = this.jwt.sign({ ...payload, type: 'access' }, { expiresIn: '7d' });
    const refreshToken = this.jwt.sign({ ...payload, type: 'refresh' }, { expiresIn: '30d' });
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
