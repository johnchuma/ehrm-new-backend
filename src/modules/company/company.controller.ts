import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, UpdateSettingsDto } from '../auth/dto';

@ApiTags('Company')
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('companies')
  @ApiOperation({ summary: 'List all companies' })
  async findAll(@Query() query: any) {
    const companies = await this.prisma.company.findMany();
    return { companies };
  }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company by ID' })
  async findOne(@Param('id') id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (company) return company;
    const users = await this.prisma.user.findMany({ where: { companyId: id } });
    return { id, name: users.length > 0 ? `Company (${users.length} users)` : 'Unnamed', email: '', users: users.length };
  }

  @Post('companies')
  @ApiOperation({ summary: 'Create a company' })
  @ApiBody({ type: CreateCompanyDto })
  async create(@Body() body: CreateCompanyDto) {
    const slug = (body.name || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return this.prisma.company.create({
      data: { name: body.name || '', slug, email: body.email || '', phone: body.phone || '', country: body.country || 'Tanzania', currency: body.currency || 'TZS', subscriptionPlan: body.subscriptionPlan || 'FREE' },
    });
  }

  @Put('companies/:id')
  @ApiOperation({ summary: 'Update company' })
  @ApiBody({ type: UpdateCompanyDto })
  async update(@Param('id') id: string, @Body() body: UpdateCompanyDto) {
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.industry !== undefined) data.industry = body.industry;
    if (body.country !== undefined) data.country = body.country;
    if (body.currency !== undefined) data.currency = body.currency;
    if (body.subscriptionPlan !== undefined) data.subscriptionPlan = body.subscriptionPlan;
    if (body.status !== undefined) data.status = body.status;
    return this.prisma.company.update({ where: { id }, data });
  }

  @Get('settings/:companyId')
  @ApiOperation({ summary: 'Get company settings' })
  async getSettings(@Param('companyId') companyId: string) {
    const settings = await this.prisma.companySettings.findUnique({ where: { companyId } });
    return settings || { companyId, generalSettings: '{}' };
  }

  @Put('settings/:companyId')
  @ApiOperation({ summary: 'Update company settings' })
  @ApiBody({ type: UpdateSettingsDto })
  async updateSettings(@Param('companyId') companyId: string, @Body() body: UpdateSettingsDto) {
    return this.prisma.companySettings.upsert({
      where: { companyId },
      create: { companyId, generalSettings: body.generalSettings || '{}' },
      update: { generalSettings: body.generalSettings },
    });
  }

  @Get('branches')
  @ApiOperation({ summary: 'List branches' })
  async listBranches(@Query() query: any) {
    const branches = await this.prisma.branch.findMany({ where: query.companyId ? { companyId: query.companyId } : {} });
    return { branches };
  }

  @Get('departments')
  @ApiOperation({ summary: 'List departments' })
  async listDepartments(@Query() query: any) {
    const departments = await this.prisma.department.findMany({ where: query.companyId ? { companyId: query.companyId } : {} });
    return { departments };
  }
}
