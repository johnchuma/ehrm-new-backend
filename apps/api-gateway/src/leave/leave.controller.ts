import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeaveRequestService } from '../../../leave-service/src/leave-requests/leave-requests.service';
import { LeaveTypeService } from '../../../leave-service/src/leave-types/leave-types.service';
import { LeaveBalanceService } from '../../../leave-service/src/leave-balances/leave-balances.service';
import { EncashmentService } from '../../../leave-service/src/encashment/encashment.service';
import { BlackoutService } from '../../../leave-service/src/blackouts/blackouts.service';

@ApiTags('Leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leave')
export class LeaveController {
  constructor(
    private readonly reqService: LeaveRequestService,
    private readonly typeService: LeaveTypeService,
    private readonly balService: LeaveBalanceService,
    private readonly encService: EncashmentService,
    private readonly boService: BlackoutService,
  ) {}

  // Requests
  @Post('requests')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'leaveTypeId', 'startDate', 'endDate', 'reason'],
      properties: {
        employeeId: { type: 'string', example: 'emp-204' },
        companyId: { type: 'string', example: 'comp-501' },
        leaveTypeId: { type: 'string', example: 'lt-annual-01' },
        startDate: { type: 'string', example: '2025-07-14' },
        endDate: { type: 'string', example: '2025-07-25' },
        reason: { type: 'string', example: 'Family vacation to Zanzibar' },
      },
    },
  })
  create(@Body() body: any) { return this.reqService.create(body); }

  @Get('requests')
  list(@Query() query: any) { return this.reqService.list(query.companyId, query); }

  @Get('requests/:id')
  get(@Param('id') id: string) { return this.reqService.get(id); }

  @Post('requests/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string', example: 'emp-mng-001' },
        notes: { type: 'string', example: 'Approved. Ensure handover is completed before leave starts.' },
      },
    },
  })
  approve(@Param('id') id: string, @Body() body: any) { return this.reqService.approve(id, body.approvedBy, body.notes); }

  @Post('requests/:id/reject')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['rejectedBy', 'reason'],
      properties: {
        rejectedBy: { type: 'string', example: 'emp-mng-001' },
        reason: { type: 'string', example: 'Requested dates overlap with critical project deadline' },
      },
    },
  })
  reject(@Param('id') id: string, @Body() body: any) { return this.reqService.reject(id, body.rejectedBy, body.reason); }

  @Get('calendar/:companyId')
  calendar(@Param('companyId') companyId: string, @Query() query: any) { return this.reqService.getCalendarEvents(companyId, query.year, query.month); }

  // Types
  @Post('types')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'code', 'defaultDays', 'isCarryForward', 'maxCarryForwardDays'],
      properties: {
        companyId: { type: 'string', example: 'comp-501' },
        name: { type: 'string', example: 'Annual Leave' },
        code: { type: 'string', example: 'AL' },
        defaultDays: { type: 'integer', example: 21 },
        isCarryForward: { type: 'boolean', example: true },
        maxCarryForwardDays: { type: 'integer', example: 5 },
      },
    },
  })
  createType(@Body() body: any) { return this.typeService.create(body); }

  @Get('types')
  listTypes(@Query() query: any) { return this.typeService.list(query.companyId); }

  @Get('types/:id')
  getType(@Param('id') id: string) { return this.typeService.get(id); }

  @Put('types/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Sick Leave' },
        defaultDays: { type: 'integer', example: 14 },
        isCarryForward: { type: 'boolean', example: false },
        maxCarryForwardDays: { type: 'integer', example: 0 },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  updateType(@Param('id') id: string, @Body() body: any) { return this.typeService.update(id, body); }

  @Delete('types/:id')
  deleteType(@Param('id') id: string) { return this.typeService.delete(id); }

  // Balances
  @Get('balances/:employeeId')
  listBalances(@Param('employeeId') employeeId: string) { return this.balService.listBalances(undefined, employeeId); }

  @Post('balances/accrue')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'employeeId', 'leaveTypeId', 'period', 'days'],
      properties: {
        companyId: { type: 'string', example: 'comp-501' },
        employeeId: { type: 'string', example: 'emp-204' },
        leaveTypeId: { type: 'string', example: 'lt-annual-01' },
        period: { type: 'string', example: '2025-06' },
        days: { type: 'number', example: 1.75 },
      },
    },
  })
  accrue(@Body() body: any) { return this.balService.accrue(body); }

  // Encashment
  @Post('encashments')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'leaveTypeId', 'days', 'rate'],
      properties: {
        employeeId: { type: 'string', example: 'emp-523' },
        companyId: { type: 'string', example: 'comp-501' },
        leaveTypeId: { type: 'string', example: 'lt-annual-01' },
        days: { type: 'number', example: 3 },
        rate: { type: 'number', example: 45000 },
      },
    },
  })
  createEnc(@Body() body: any) { return this.encService.create(body); }

  @Get('encashments')
  listEnc(@Query() query: any) { return this.encService.list(query.companyId, query.status); }

  // Blackouts
  @Post('blackouts')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'startDate', 'endDate', 'description'],
      properties: {
        companyId: { type: 'string', example: 'comp-501' },
        name: { type: 'string', example: 'Year-End Close Period' },
        startDate: { type: 'string', example: '2025-12-20' },
        endDate: { type: 'string', example: '2025-12-31' },
        description: { type: 'string', example: 'No leave allowed during year-end financial closing' },
      },
    },
  })
  createBO(@Body() body: any) { return this.boService.create(body); }

  @Get('blackouts')
  listBO(@Query() query: any) { return this.boService.list(query.companyId); }

  // Liability
  @Get('liability/:companyId')
  getLiability(@Param('companyId') companyId: string) { return this.balService.getLiability(companyId); }
}
