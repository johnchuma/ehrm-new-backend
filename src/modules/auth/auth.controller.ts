import { Controller, Post, Get, Body, HttpCode, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { RegisterWorkspaceDto } from './dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EmailService } from '../notifications/email.service';
import * as bcrypt from 'bcryptjs';

class RefreshDto {
  @IsNotEmpty() @IsString() refreshToken: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  login(@Body() body: LoginDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip;
    const userAgent = req.headers['user-agent'] ?? undefined;
    return this.auth.login(body.email, body.password, ip, userAgent);
  }

  @Public()
  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Public()
  @Post('register-workspace')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new workspace (company + admin)' })
  @ApiBody({ type: RegisterWorkspaceDto })
  async registerWorkspace(@Body() body: RegisterWorkspaceDto) {
    const email = (body.email || '').toLowerCase();
    const relatedCompanies = [
      {
        company: body.company || '',
        sector: body.sector,
        size: body.size,
        country: body.country || 'Tanzania',
        currency: body.currency || 'TZS',
      },
      ...((body.additionalCompanies || [])
        .map((company) => ({
          company: company.company || '',
          sector: company.sector,
          size: company.size,
          country: company.country || body.country || 'Tanzania',
          currency: company.currency || body.currency || 'TZS',
        }))
        .filter((company) => company.company.trim())),
    ];
    const createdCompanies = [];
    for (let index = 0; index < relatedCompanies.length; index += 1) {
      const item = relatedCompanies[index];
      const slugBase = item.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'company';
      const slug = `${slugBase}-${Date.now()}-${index + 1}`;
      const company = await this.prisma.company.create({
        data: {
          name: item.company,
          slug,
          email,
          phone: body.phone || '',
          country: item.country || 'Tanzania',
          currency: item.currency || 'TZS',
          subscriptionPlan: body.plan || 'FREE',
          status: 'ACTIVE',
          industry: item.sector || body.sector || undefined,
          size: item.size || body.size || undefined,
        },
      });
      await this.prisma.companySettings.create({ data: { companyId: company.id } });
      createdCompanies.push(company);
    }
    const hashed = await bcrypt.hash(body.password || 'demo1234', 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        firstName: body.fname || body.firstName || '',
        lastName: body.lname || body.lastName || '',
        fullName: `${body.fname || body.firstName || ''} ${body.lname || body.lastName || ''}`.trim(),
        companyId: createdCompanies[0]?.id || null,
        role: 'Company Admin',
        isActive: false,
      },
    });
    const confirmToken = this.jwt.sign({ sub: user.id, type: 'email_confirm' }, { expiresIn: '24h' });
    const confirmUrl = `${process.env.FRONTEND_URL || 'https://test.exactehrm.co.tz'}/confirm-email?token=${confirmToken}`;
    const bc = this.email.brandColor;
    this.email.send(body.email, 'Confirm your ExactEHRM account', this.email.buildHtml(`
      <h2 style="color:${bc};margin:0 0 16px">Welcome to ExactEHRM!</h2>
      <p>Hi ${body.fname || body.firstName}, your company <strong>${body.company}</strong> workspace has been created.</p>
      <p>Please confirm your email:</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${confirmUrl}" style="display:inline-block;background:${bc};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Confirm my account</a>
      </p>
    `)).catch(() => {});
    return {
      message: 'Registration successful. Please check your email to confirm your account.',
      company: createdCompanies[0]
        ? { id: createdCompanies[0].id, name: createdCompanies[0].name, subscriptionPlan: createdCompanies[0].subscriptionPlan }
        : null,
      companies: createdCompanies.map((company) => ({ id: company.id, name: company.name, email: company.email })),
      workspaceType: body.workspaceType || 'single', plan: body.plan || '', billing: body.billing || 'monthly',
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair' })
  refresh(@Body() body: RefreshDto) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all refresh tokens (logout)' })
  logout(@CurrentUser() user: any) {
    return this.auth.logout(user.sub);
  }

  @Public()
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: any) {
    const authHeader = req.headers?.authorization;
    if (!authHeader) throw new Error('Unauthorized');
    return this.auth.validateToken(authHeader.replace('Bearer ', ''));
  }

  @Public()
  @Post('login/phone')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  sendOtp(@Body() body: { phone: string }) {
    return this.auth.sendOtp(body.phone);
  }

  @Public()
  @Post('login/phone/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify OTP and login' })
  verifyOtp(@Body() body: { phone: string; otp: string }) {
    return this.auth.verifyOtp(body.phone, body.otp);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send password reset email' })
  forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() body: { token: string; password: string }) {
    return this.auth.resetPassword(body.token, body.password);
  }

  @Public()
  @Post('confirm-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm email address with token' })
  confirmEmail(@Body() body: { token: string }) {
    return this.auth.confirmEmail(body.token);
  }

  @Public()
  @Post('resend-confirmation')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend email confirmation link' })
  resendConfirmation(@Body() body: { email: string }) {
    return this.auth.resendConfirmation(body.email);
  }
}
