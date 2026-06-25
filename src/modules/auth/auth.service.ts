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
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid email or password');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
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
    // Send welcome email
    this.email.send(data.email, 'Welcome to ExactEHRM', `<h2>Welcome!</h2><p>Hi ${data.firstName}, your account has been created successfully.</p>`).catch(() => {});
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
    this.email.send(email, 'Reset your ExactEHRM password', `<h2>Password Reset</h2><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`).catch(() => {});
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
