import { Controller, Post, Get, Put, Body, HttpCode, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
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
        isActive: true,
      },
    });
    // Send welcome email
    this.email.send(body.email, 'Welcome to ExactEHRM — Your workspace is ready',
      `<h2>Welcome to ExactEHRM!</h2><p>Hi ${body.fname}, your company <strong>${body.company}</strong> workspace has been created.</p><p>You can now log in and start managing your HR.</p>`
    ).catch(() => {});
    const tokens = this.auth.generateTokens({ sub: user.id, email: user.email });
    return {
      ...tokens, user,
      company: { id: company.id, name: company.name, subscriptionPlan: company.subscriptionPlan },
      workspaceType: body.workspaceType || 'single', plan: body.plan || '', billing: body.billing || 'monthly',
    };
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
