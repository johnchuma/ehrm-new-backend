import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  private runService: any;
  private advService: any;
  private dedService: any;
  private alwService: any;
  private bonService: any;
  private setService: any;
  private jService: any;

  constructor(@Inject(GRPC_SERVICES.PAYROLL) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.runService = this.client.getService('PayrollRunService');
    this.advService = this.client.getService('SalaryAdvanceService');
    this.dedService = this.client.getService('DeductionService');
    this.alwService = this.client.getService('AllowanceService');
    this.bonService = this.client.getService('BonusService');
    this.setService = this.client.getService('SettlementService');
    this.jService = this.client.getService('PayrollJournalService');
  }

  @Post('runs')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'period', 'startDate', 'endDate', 'paymentDate'],
      properties: {
        companyId: { type: 'string', example: 'comp-501' },
        period: { type: 'string', example: '2025-06' },
        startDate: { type: 'string', example: '2025-06-01' },
        endDate: { type: 'string', example: '2025-06-30' },
        paymentDate: { type: 'string', example: '2025-06-28' },
      },
    },
  })
  generate(@Body() body: any) { return firstValueFrom(this.runService.GeneratePayroll(body)); }

  @Get('runs')
  list(@Query() query: any) { return firstValueFrom(this.runService.ListRuns(query)); }

  @Get('runs/:id')
  getRun(@Param('id') id: string) { return firstValueFrom(this.runService.GetRun({ id })); }

  @Get('runs/:id/details')
  getRunDetails(@Param('id') id: string) { return firstValueFrom(this.runService.GetRunDetails({ id })); }

  @Post('runs/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string', example: 'emp-mng-001' },
        notes: { type: 'string', example: 'June 2025 payroll verified and approved' },
      },
    },
  })
  approveRun(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.runService.ApproveRun({ id, ...body })); }

  @Post('runs/:id/publish')
  publish(@Param('id') id: string) { return firstValueFrom(this.runService.PublishPayslips({ id })); }

  @Post('advances')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'amount', 'reason', 'repaymentMonths'],
      properties: {
        employeeId: { type: 'string', example: 'emp-204' },
        companyId: { type: 'string', example: 'comp-501' },
        amount: { type: 'number', example: 850000 },
        reason: { type: 'string', example: 'Medical emergency' },
        repaymentMonths: { type: 'integer', example: 6 },
      },
    },
  })
  createAdv(@Body() body: any) { return firstValueFrom(this.advService.CreateAdvance(body)); }

  @Get('advances')
  listAdv(@Query() query: any) { return firstValueFrom(this.advService.ListAdvances(query)); }

  @Post('deductions')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'type', 'amount', 'description', 'isRecurring'],
      properties: {
        employeeId: { type: 'string', example: 'emp-307' },
        companyId: { type: 'string', example: 'comp-501' },
        type: { type: 'string', example: 'loan-repayment' },
        amount: { type: 'number', example: 150000 },
        description: { type: 'string', example: 'Salary advance loan deduction for June' },
        isRecurring: { type: 'boolean', example: true },
      },
    },
  })
  createDed(@Body() body: any) { return firstValueFrom(this.dedService.CreateDeduction(body)); }

  @Get('deductions')
  listDed(@Query() query: any) { return firstValueFrom(this.dedService.ListDeductions(query)); }

  @Post('allowances')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'type', 'amount', 'description', 'isRecurring'],
      properties: {
        employeeId: { type: 'string', example: 'emp-115' },
        companyId: { type: 'string', example: 'comp-501' },
        type: { type: 'string', example: 'transport' },
        amount: { type: 'number', example: 250000 },
        description: { type: 'string', example: 'Monthly transport allowance' },
        isRecurring: { type: 'boolean', example: true },
      },
    },
  })
  createAlw(@Body() body: any) { return firstValueFrom(this.alwService.CreateAllowance(body)); }

  @Get('allowances')
  listAlw(@Query() query: any) { return firstValueFrom(this.alwService.ListAllowances(query)); }

  @Post('bonuses')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'type', 'amount', 'description', 'paymentDate'],
      properties: {
        employeeId: { type: 'string', example: 'emp-412' },
        companyId: { type: 'string', example: 'comp-501' },
        type: { type: 'string', example: 'performance' },
        amount: { type: 'number', example: 1200000 },
        description: { type: 'string', example: 'Q2 2025 performance bonus' },
        paymentDate: { type: 'string', example: '2025-06-28' },
      },
    },
  })
  createBon(@Body() body: any) { return firstValueFrom(this.bonService.CreateBonus(body)); }

  @Get('bonuses')
  listBon(@Query() query: any) { return firstValueFrom(this.bonService.ListBonuses(query)); }

  @Post('settlements')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'amount', 'type', 'reason', 'paymentDate'],
      properties: {
        employeeId: { type: 'string', example: 'emp-523' },
        companyId: { type: 'string', example: 'comp-501' },
        amount: { type: 'number', example: 3500000 },
        type: { type: 'string', example: 'end-of-service' },
        reason: { type: 'string', example: 'Contract termination settlement' },
        paymentDate: { type: 'string', example: '2025-06-30' },
      },
    },
  })
  createSet(@Body() body: any) { return firstValueFrom(this.setService.CreateSettlement(body)); }

  @Get('settlements')
  listSet(@Query() query: any) { return firstValueFrom(this.setService.ListSettlements(query)); }

  @Get('journal')
  getJournal(@Query() query: any) { return firstValueFrom(this.jService.GetJournal(query)); }

  @Post('journal/export')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'period', 'format', 'startDate', 'endDate'],
      properties: {
        companyId: { type: 'string', example: 'comp-501' },
        period: { type: 'string', example: '2025-06' },
        format: { type: 'string', example: 'pdf' },
        startDate: { type: 'string', example: '2025-06-01' },
        endDate: { type: 'string', example: '2025-06-30' },
      },
    },
  })
  exportJournal(@Body() body: any) { return firstValueFrom(this.jService.ExportJournal(body)); }
}
