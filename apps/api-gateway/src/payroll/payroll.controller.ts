import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PayrollRunService } from '../../../payroll-service/src/payroll-runs/payroll-runs.service';
import { AdvanceService } from '../../../payroll-service/src/salary-advance/salary-advance.service';
import { DeductionService } from '../../../payroll-service/src/deductions/deductions.service';
import { AllowanceService } from '../../../payroll-service/src/allowances/allowances.service';
import { BonusService } from '../../../payroll-service/src/bonuses/bonuses.service';
import { SettlementService } from '../../../payroll-service/src/settlements/settlements.service';
import { JournalService } from '../../../payroll-service/src/journal/journal.service';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly runService: PayrollRunService,
    private readonly advService: AdvanceService,
    private readonly dedService: DeductionService,
    private readonly alwService: AllowanceService,
    private readonly bonService: BonusService,
    private readonly setService: SettlementService,
    private readonly jService: JournalService,
  ) {}

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
  generate(@Body() body: any) { return this.runService.generate(body); }

  @Get('runs')
  list(@Query() query: any) { return this.runService.list(query.companyId, query); }

  @Get('runs/:id')
  getRun(@Param('id') id: string) { return this.runService.get(id); }

  @Get('runs/:id/details')
  getRunDetails(@Param('id') id: string) { return this.runService.getDetails(id); }

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
  approveRun(@Param('id') id: string, @Body() body: any) { return this.runService.approve(id, body.approvedBy); }

  @Post('runs/:id/publish')
  publish(@Param('id') id: string) { return this.runService.publishPayslips(id); }

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
  createAdv(@Body() body: any) { return this.advService.create(body); }

  @Get('advances')
  listAdv(@Query() query: any) { return this.advService.list(query.companyId, query.status); }

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
  createDed(@Body() body: any) { return this.dedService.create(body); }

  @Get('deductions')
  listDed(@Query() query: any) { return this.dedService.list(query.companyId); }

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
  createAlw(@Body() body: any) { return this.alwService.create(body); }

  @Get('allowances')
  listAlw(@Query() query: any) { return this.alwService.list(query.companyId); }

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
  createBon(@Body() body: any) { return this.bonService.create(body); }

  @Get('bonuses')
  listBon(@Query() query: any) { return this.bonService.list(query.companyId, query.type); }

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
  createSet(@Body() body: any) { return this.setService.create(body); }

  @Get('settlements')
  listSet(@Query() query: any) { return this.setService.list(query.companyId, query.status); }

  @Get('journal')
  getJournal(@Query() query: any) { return this.jService.getJournal(query); }

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
  exportJournal(@Body() body: any) { return this.jService.exportJournal(body); }
}
