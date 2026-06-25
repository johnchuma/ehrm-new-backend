import { Controller, Post, Get, Body, HttpCode, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { RegisterWorkspaceDto } from './dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
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
    const tokens = await this.auth.generateTokens({ sub: user.id, email: user.email ?? '' });
    return {
      ...tokens, user,
      company: { id: company.id, name: company.name, subscriptionPlan: company.subscriptionPlan },
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
  @ApiOperation({ summary: 'Revoke all refresh tokens for the current user' })
  logout(@CurrentUser() user: any) {
    return this.auth.logout(user.sub);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @Public()
  getProfile(@Req() req: any) {
    const authHeader = req.headers?.authorization;
    if (!authHeader) throw new Error('Unauthorized');
    return this.auth.validateToken(authHeader.replace('Bearer ', ''));
  }
}
