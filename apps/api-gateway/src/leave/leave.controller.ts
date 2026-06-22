import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leave')
export class LeaveController {
  private reqService: any;
  private typeService: any;
  private balService: any;
  private encService: any;
  private boService: any;
  private liabService: any;

  constructor(@Inject(GRPC_SERVICES.LEAVE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.reqService = this.client.getService('LeaveRequestService');
    this.typeService = this.client.getService('LeaveTypeService');
    this.balService = this.client.getService('LeaveBalanceService');
    this.encService = this.client.getService('LeaveEncashmentService');
    this.boService = this.client.getService('BlackoutPeriodService');
    this.liabService = this.client.getService('LeaveLiabilityService');
  }

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
  create(@Body() body: any) { return firstValueFrom(this.reqService.CreateRequest(body)); }

  @Get('requests')
  list(@Query() query: any) { return firstValueFrom(this.reqService.ListRequests(query)); }

  @Get('requests/:id')
  get(@Param('id') id: string) { return firstValueFrom(this.reqService.GetRequest({ id })); }

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
  approve(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.reqService.ApproveRequest({ id, ...body })); }

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
  reject(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.reqService.RejectRequest({ id, ...body })); }

  @Get('calendar/:companyId')
  calendar(@Param('companyId') companyId: string, @Query() query: any) { return firstValueFrom(this.reqService.GetCalendarEvents({ companyId, ...query })); }

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
  createType(@Body() body: any) { return firstValueFrom(this.typeService.CreateType(body)); }

  @Get('types')
  listTypes(@Query() query: any) { return firstValueFrom(this.typeService.ListTypes(query)); }

  @Get('types/:id')
  getType(@Param('id') id: string) { return firstValueFrom(this.typeService.GetType({ id })); }

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
  updateType(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.typeService.UpdateType({ id, ...body })); }

  @Delete('types/:id')
  deleteType(@Param('id') id: string) { return firstValueFrom(this.typeService.DeleteType({ id })); }

  // Balances
  @Get('balances/:employeeId')
  listBalances(@Param('employeeId') employeeId: string) { return firstValueFrom(this.balService.ListBalances({ employeeId })); }

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
  accrue(@Body() body: any) { return firstValueFrom(this.balService.AccrueLeave(body)); }

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
  createEnc(@Body() body: any) { return firstValueFrom(this.encService.CreateEncashment(body)); }

  @Get('encashments')
  listEnc(@Query() query: any) { return firstValueFrom(this.encService.ListEncashments(query)); }

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
  createBO(@Body() body: any) { return firstValueFrom(this.boService.CreateBlackout(body)); }

  @Get('blackouts')
  listBO(@Query() query: any) { return firstValueFrom(this.boService.ListBlackouts(query)); }

  // Liability
  @Get('liability/:companyId')
  getLiability(@Param('companyId') companyId: string) { return firstValueFrom(this.liabService.GetLiability({ companyId })); }
}
