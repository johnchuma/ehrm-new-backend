import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyService } from '../../../company-service/src/companies/companies.service';
import { BranchService } from '../../../company-service/src/branches/branches.service';
import { DepartmentService } from '../../../company-service/src/departments/departments.service';
import { SettingsService } from '../../../company-service/src/settings/settings.service';

@ApiTags('Company')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly branchService: BranchService,
    private readonly departmentService: DepartmentService,
    private readonly settingsService: SettingsService,
  ) {}

  // Companies
  @Post('companies')
  @ApiOperation({ summary: 'Create company' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'registrationNumber', 'taxId', 'address', 'phone', 'email', 'industry'],
      properties: {
        name: { type: 'string', example: 'Acacia Group Ltd' },
        registrationNumber: { type: 'string', example: 'BN-2024-00156' },
        taxId: { type: 'string', example: 'TIN-123-456-789' },
        address: { type: 'string', example: '15 Ohio Street, Dar es Salaam, Tanzania' },
        phone: { type: 'string', example: '+255222123456' },
        email: { type: 'string', example: 'info@acacia.co.tz' },
        industry: { type: 'string', example: 'Agriculture & Export' },
      },
    },
  })
  createCompany(@Body() body: any) { return this.companyService.createCompany(body); }

  @Get('companies')
  @ApiOperation({ summary: 'List companies' })
  listCompanies(@Query() query: any) { return this.companyService.listCompanies(query.page, query.pageSize, query.search, query.status); }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company' })
  getCompany(@Param('id') id: string) { return this.companyService.getCompany(id); }

  @Put('companies/:id')
  @ApiOperation({ summary: 'Update company' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Acacia Group Ltd' },
        registrationNumber: { type: 'string', example: 'BN-2024-00156' },
        taxId: { type: 'string', example: 'TIN-123-456-789' },
        address: { type: 'string', example: '15 Ohio Street, Dar es Salaam, Tanzania' },
        phone: { type: 'string', example: '+255222123456' },
        email: { type: 'string', example: 'info@acacia.co.tz' },
        industry: { type: 'string', example: 'Agriculture & Export' },
      },
    },
  })
  updateCompany(@Param('id') id: string, @Body() body: any) { return this.companyService.updateCompany(id, body); }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Delete company' })
  deleteCompany(@Param('id') id: string) { return this.companyService.deleteCompany(id); }

  // Branches
  @Post('branches')
  @ApiOperation({ summary: 'Create branch' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'address', 'phone', 'isHeadquarters'],
      properties: {
        companyId: { type: 'string', example: 'cmp_9f8e7d6c5b4a' },
        name: { type: 'string', example: 'Acacia Dar es Salaam Branch' },
        address: { type: 'string', example: '23 Morogoro Road, Dar es Salaam, Tanzania' },
        phone: { type: 'string', example: '+255222987654' },
        isHeadquarters: { type: 'boolean', example: true },
      },
    },
  })
  createBranch(@Body() body: any) { return this.branchService.createBranch(body); }

  @Get('branches')
  @ApiOperation({ summary: 'List branches' })
  listBranches(@Query() query: any) { return this.branchService.listBranches(query.companyId); }

  @Get('branches/:id')
  getBranch(@Param('id') id: string) { return this.branchService.getBranch(id); }

  @Put('branches/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Acacia Mwanza Branch' },
        address: { type: 'string', example: '45 Kenyatta Drive, Mwanza, Tanzania' },
        phone: { type: 'string', example: '+255282456789' },
        isHeadquarters: { type: 'boolean', example: false },
      },
    },
  })
  updateBranch(@Param('id') id: string, @Body() body: any) { return this.branchService.updateBranch(id, body); }

  @Delete('branches/:id')
  deleteBranch(@Param('id') id: string) { return this.branchService.deleteBranch(id); }

  // Departments
  @Post('departments')
  @ApiOperation({ summary: 'Create department' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'code', 'managerId', 'parentId'],
      properties: {
        companyId: { type: 'string', example: 'cmp_9f8e7d6c5b4a' },
        name: { type: 'string', example: 'Human Resources' },
        code: { type: 'string', example: 'HR-001' },
        managerId: { type: 'string', example: 'usr_a1b2c3d4e5f6' },
        parentId: { type: 'string', example: 'dept_001', nullable: true },
      },
    },
  })
  createDepartment(@Body() body: any) { return this.departmentService.createDepartment(body); }

  @Get('departments')
  listDepartments(@Query() query: any) { return this.departmentService.listDepartments(query.companyId, query.branchId); }

  @Get('departments/:id')
  getDepartment(@Param('id') id: string) { return this.departmentService.getDepartment(id); }

  @Put('departments/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Finance & Accounting' },
        code: { type: 'string', example: 'FIN-001' },
        managerId: { type: 'string', example: 'usr_f6g7h8i9j0k1' },
        parentId: { type: 'string', example: 'dept_001', nullable: true },
      },
    },
  })
  updateDepartment(@Param('id') id: string, @Body() body: any) { return this.departmentService.updateDepartment(id, body); }

  @Delete('departments/:id')
  deleteDepartment(@Param('id') id: string) { return this.departmentService.deleteDepartment(id); }

  // Settings
  @Get('settings/:companyId')
  getSettings(@Param('companyId') companyId: string) { return this.settingsService.getSettings(companyId); }

  @Put('settings/:companyId')
  @ApiOperation({ summary: 'Update company settings' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currency: { type: 'string', example: 'TZS' },
        timezone: { type: 'string', example: 'Africa/Dar_es_Salaam' },
        dateFormat: { type: 'string', example: 'DD/MM/YYYY' },
        leavePolicy: { type: 'string', example: '21 working days annual leave' },
        workingHours: { type: 'string', example: '08:00 - 17:00, Monday to Friday' },
      },
    },
  })
  updateSettings(@Param('companyId') companyId: string, @Body() body: any) { return this.settingsService.updateSettings(companyId, body); }
}
