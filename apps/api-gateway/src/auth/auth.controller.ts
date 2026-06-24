import { Controller, Post, Body, HttpCode, UseGuards, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Public } from '../../../../libs/common/src/decorators';
import { IamAuthService } from '../../../iam-service/src/auth/auth.service';
import { CompanyService } from '../../../company-service/src/companies/companies.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly iamAuthService: IamAuthService,
    private readonly companyService: CompanyService,
  ) {}

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
    return this.iamAuthService.loginWithEmail(body.email, body.password);
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
    return this.iamAuthService.loginWithPhone(body.phone, body.password);
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
    return this.iamAuthService.register(body);
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
    return this.iamAuthService.validateToken(body.token);
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
    return this.iamAuthService.refreshToken(body.refreshToken);
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
    return this.iamAuthService.forgotPassword(body.email);
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
    return this.iamAuthService.resetPassword(body.token, body.newPassword);
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
    return this.iamAuthService.changePassword(body.userId, body.oldPassword, body.newPassword);
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
    return this.iamAuthService.logout(body.userId);
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
  async registerWorkspace(@Body() body: any) {
    const slug = body.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const currencyCode = body.currency?.split(' ')[0] || 'TZS';

    const company = await this.companyService.createCompany({
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
    });

    const result = await this.iamAuthService.register({
      email: body.email,
      phone: body.phone || '',
      password: body.password,
      firstName: body.fname,
      lastName: body.lname,
      companyId: company.id,
    });

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
