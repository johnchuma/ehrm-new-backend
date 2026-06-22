import { Controller, Post, Body, HttpCode, UseGuards, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { Public } from '../../../../libs/common/src/decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private iamService: any;
  private companyService: any;

  constructor(
    @Inject(GRPC_SERVICES.IAM) private readonly client: ClientGrpc,
    @Inject(GRPC_SERVICES.COMPANY) private readonly companyClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.iamService = this.client.getService('AuthService');
    this.companyService = this.companyClient.getService('CompanyService');
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'hr.admin@acaciagroup.co.tz' },
        password: { type: 'string', example: 'demo1234' },
        companyId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginWithEmail(@Body() body: { email: string; password: string; companyId?: string }) {
    return firstValueFrom(this.iamService.Login(body));
  }

  @Public()
  @Post('login/phone')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with phone and password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '+255712345678' },
        password: { type: 'string' },
        companyId: { type: 'string' },
      },
    },
  })
  async loginWithPhone(@Body() body: { phone: string; password: string; companyId?: string }) {
    return firstValueFrom(this.iamService.LoginWithPhone(body));
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        phone: { type: 'string' },
        password: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        companyId: { type: 'string' },
      },
    },
  })
  async register(@Body() body: any) {
    return firstValueFrom(this.iamService.Register(body));
  }

  @Post('validate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  async validateToken(@Body() body: { token: string }) {
    return firstValueFrom(this.iamService.ValidateToken(body));
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: { type: 'string', example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...' },
      },
    },
  })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return firstValueFrom(this.iamService.RefreshToken(body));
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', example: 'hr.admin@acaciagroup.co.tz' },
        companyId: { type: 'string', example: 'comp_001' },
      },
    },
  })
  async forgotPassword(@Body() body: { email: string; companyId?: string }) {
    return firstValueFrom(this.iamService.ForgotPassword(body));
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token', 'newPassword'],
      properties: {
        token: { type: 'string', example: 'reset-token-from-email' },
        newPassword: { type: 'string', example: 'NewP@ssw0rd!' },
      },
    },
  })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return firstValueFrom(this.iamService.ResetPassword(body));
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'oldPassword', 'newPassword'],
      properties: {
        userId: { type: 'string', example: 'user_001' },
        oldPassword: { type: 'string', example: 'demo1234' },
        newPassword: { type: 'string', example: 'NewP@ssw0rd!' },
      },
    },
  })
  async changePassword(@Body() body: { userId: string; oldPassword: string; newPassword: string }) {
    return firstValueFrom(this.iamService.ChangePassword(body));
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string', example: 'user_001' },
      },
    },
  })
  async logout(@Body() body: { userId: string }) {
    return firstValueFrom(this.iamService.Logout(body));
  }

  @Public()
  @Post('register-workspace')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new workspace with company and admin user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['workspaceType', 'company', 'fname', 'lname', 'email', 'password', 'plan'],
      properties: {
        workspaceType: { type: 'string', enum: ['single', 'multi'], example: 'single' },
        company: { type: 'string', example: 'Acacia Group Ltd' },
        employees: { type: 'number', example: 1284 },
        sector: { type: 'string', example: 'Manufacturing' },
        size: { type: 'string', example: '201–500' },
        country: { type: 'string', example: 'Tanzania' },
        currency: { type: 'string', example: 'TZS (Tanzanian Shilling)' },
        additionalCompanies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              company: { type: 'string' },
              sector: { type: 'string' },
              size: { type: 'string' },
              country: { type: 'string' },
              currency: { type: 'string' },
            },
          },
        },
        fname: { type: 'string', example: 'Joyce' },
        lname: { type: 'string', example: 'Massawe' },
        email: { type: 'string', example: 'hr.admin@acaciagroup.co.tz' },
        phone: { type: 'string', example: '+255712000000' },
        password: { type: 'string', example: 'SecureP@ss123' },
        plan: { type: 'string', example: 'HR Professional' },
        billing: { type: 'string', enum: ['monthly', 'annual'], example: 'monthly' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Workspace created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Company or user already exists' })
  async registerWorkspace(@Body() body: {
    workspaceType: string;
    company: string;
    employees?: number;
    sector?: string;
    size?: string;
    country?: string;
    currency?: string;
    additionalCompanies?: Array<{ company: string; sector?: string; size?: string; country?: string; currency?: string }>;
    fname: string;
    lname: string;
    email: string;
    phone?: string;
    password: string;
    plan: string;
    billing?: string;
  }) {
    const slug = body.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const currencyCode = body.currency?.split(' ')[0] || 'TZS';

    const company = await firstValueFrom(this.companyService.CreateCompany({
      name: body.company,
      slug,
      email: body.email,
      phone: body.phone || '',
      country: body.country || 'Tanzania',
      currency: currencyCode,
      timezone: 'Africa/Dar_es_Salaam',
      subscriptionPlan: body.plan || 'FREE',
      industry: body.sector || '',
      size: body.size || '',
    })) as any;

    if (body.additionalCompanies?.length) {
      for (const extra of body.additionalCompanies) {
        const extraSlug = extra.company
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const extraCurrency = extra.currency?.split(' ')[0] || currencyCode;
        await firstValueFrom(this.companyService.CreateCompany({
          name: extra.company,
          slug: `${slug}-${extraSlug}`,
          email: body.email,
          phone: body.phone || '',
          country: extra.country || body.country || 'Tanzania',
          currency: extraCurrency,
          timezone: 'Africa/Dar_es_Salaam',
          subscriptionPlan: body.plan || 'FREE',
          industry: extra.sector || '',
          size: extra.size || '',
        }));
      }
    }

    const result = await firstValueFrom(this.iamService.Register({
      email: body.email,
      phone: body.phone || '',
      password: body.password,
      firstName: body.fname,
      lastName: body.lname,
      companyId: company.id,
    })) as any;

    return {
      ...result,
      company,
      workspaceType: body.workspaceType,
      plan: body.plan,
      billing: body.billing || 'monthly',
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@Req() req: any) {
    return req.user;
  }
}
