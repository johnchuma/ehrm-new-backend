import { Controller, Post, Get, Put, Body, HttpCode, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { RegisterWorkspaceDto } from './dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import * as bcrypt from 'bcryptjs';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly jwt: JwtService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Post('register-workspace')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new workspace (company + admin)' })
  @ApiBody({ type: RegisterWorkspaceDto })
  async registerWorkspace(@Body() body: RegisterWorkspaceDto) {
    const slug = (body.company || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
    const company = await this.prisma.company.create({
      data: { name: body.company || '', slug, email: body.email || '', phone: body.phone || '', country: body.country || 'Tanzania', currency: body.currency || 'TZS', subscriptionPlan: body.plan || 'FREE', status: 'ACTIVE' },
    });
    await this.prisma.companySettings.create({ data: { companyId: company.id } });
    const hashed = await bcrypt.hash(body.password || 'demo1234', 12);
    const user = await this.prisma.user.create({
      data: {
        email: (body.email || '').toLowerCase(),
        password: hashed,
        firstName: body.fname || body.firstName || '',
        lastName: body.lname || body.lastName || '',
        fullName: `${body.fname || body.firstName || ''} ${body.lname || body.lastName || ''}`.trim(),
        companyId: company.id,
        isActive: false,
      },
    });
    const confirmToken = this.jwt.sign({ sub: user.id, type: 'email_confirm' }, { expiresIn: '24h' });
    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-email?token=${confirmToken}`;
    const bc = this.email.brandColor;
    this.email.send(body.email, 'Confirm your ExactEHRM account',
      this.email.buildHtml(`
        <h2 style="color:${bc};margin:0 0 16px">Welcome to ExactEHRM!</h2>
        <p>Hi ${body.fname}, your company <strong>${body.company}</strong> workspace has been created.</p>
        <p>Please confirm your email by clicking the button below:</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${confirmUrl}" style="display:inline-block;background:${bc};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Confirm my account</a>
        </p>
        <p style="color:#888;font-size:13px">This link expires in 24 hours.</p>
      `)
    ).catch(() => {});
    return {
      message: 'Registration successful. Please check your email to confirm your account.',
      company: { id: company.id, name: company.name, subscriptionPlan: company.subscriptionPlan },
      workspaceType: body.workspaceType || 'single', plan: body.plan || '', billing: body.billing || 'monthly',
    };
  }

  @Post('confirm-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm email address with token' })
  async confirmEmail(@Body() body: { token: string }) {
    return this.auth.confirmEmail(body.token);
  }

  @Post('resend-confirmation')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend email confirmation link' })
  async resendConfirmation(@Body() body: { email: string }) {
    return this.auth.resendConfirmation(body.email);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: any) {
    const authHeader = req.headers?.authorization;
    if (!authHeader) throw new Error('Unauthorized');
    return this.auth.validateToken(authHeader.replace('Bearer ', ''));
  }

  // ── Phone OTP Login ──

  @Post('login/phone')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  async sendOtp(@Body() body: { phone: string }) {
    return this.auth.sendOtp(body.phone);
  }

  @Post('login/phone/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify OTP and login' })
  async verifyOtp(@Body() body: { phone: string; otp: string }) {
    return this.auth.verifyOtp(body.phone, body.otp);
  }

  // ── Forgot / Reset Password ──

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send password reset email' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.auth.resetPassword(body.token, body.password);
  }
}
