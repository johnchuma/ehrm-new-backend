import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Company')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController {
  private companyService: any;
  private branchService: any;
  private departmentService: any;
  private settingsService: any;

  constructor(@Inject(GRPC_SERVICES.COMPANY) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.companyService = this.client.getService('CompanyService');
    this.branchService = this.client.getService('BranchService');
    this.departmentService = this.client.getService('DepartmentService');
    this.settingsService = this.client.getService('CompanySettingsService');
  }

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
  createCompany(@Body() body: any) { return firstValueFrom(this.companyService.CreateCompany(body)); }

  @Get('companies')
  @ApiOperation({ summary: 'List companies' })
  listCompanies(@Query() query: any) { return firstValueFrom(this.companyService.ListCompanies(query)); }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company' })
  getCompany(@Param('id') id: string) { return firstValueFrom(this.companyService.GetCompany({ id })); }

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
  updateCompany(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.companyService.UpdateCompany({ id, ...body })); }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Delete company' })
  deleteCompany(@Param('id') id: string) { return firstValueFrom(this.companyService.DeleteCompany({ id })); }

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
  createBranch(@Body() body: any) { return firstValueFrom(this.branchService.CreateBranch(body)); }

  @Get('branches')
  @ApiOperation({ summary: 'List branches' })
  listBranches(@Query() query: any) { return firstValueFrom(this.branchService.ListBranches(query)); }

  @Get('branches/:id')
  getBranch(@Param('id') id: string) { return firstValueFrom(this.branchService.GetBranch({ id })); }

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
  updateBranch(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.branchService.UpdateBranch({ id, ...body })); }

  @Delete('branches/:id')
  deleteBranch(@Param('id') id: string) { return firstValueFrom(this.branchService.DeleteBranch({ id })); }

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
  createDepartment(@Body() body: any) { return firstValueFrom(this.departmentService.CreateDepartment(body)); }

  @Get('departments')
  listDepartments(@Query() query: any) { return firstValueFrom(this.departmentService.ListDepartments(query)); }

  @Get('departments/:id')
  getDepartment(@Param('id') id: string) { return firstValueFrom(this.departmentService.GetDepartment({ id })); }

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
  updateDepartment(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.departmentService.UpdateDepartment({ id, ...body })); }

  @Delete('departments/:id')
  deleteDepartment(@Param('id') id: string) { return firstValueFrom(this.departmentService.DeleteDepartment({ id })); }

  // Settings
  @Get('settings/:companyId')
  getSettings(@Param('companyId') companyId: string) { return firstValueFrom(this.settingsService.GetSettings({ companyId })); }

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
  updateSettings(@Param('companyId') companyId: string, @Body() body: any) { return firstValueFrom(this.settingsService.UpdateSettings({ companyId, ...body })); }
}
