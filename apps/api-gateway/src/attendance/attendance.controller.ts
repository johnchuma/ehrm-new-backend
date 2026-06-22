import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  private attService: any;
  private excService: any;
  private shiftService: any;
  private swapService: any;
  private otService: any;
  private gfService: any;
  private apprService: any;

  constructor(@Inject(GRPC_SERVICES.ATTENDANCE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.attService = this.client.getService('AttendanceService');
    this.excService = this.client.getService('AttendanceExceptionService');
    this.shiftService = this.client.getService('ShiftService');
    this.swapService = this.client.getService('ShiftSwapService');
    this.otService = this.client.getService('OvertimeService');
    this.gfService = this.client.getService('GeofenceService');
    this.apprService = this.client.getService('AttendanceApprovalService');
  }

  // Records
  @Post('check-in')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'method'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        method: { type: 'string', example: 'geofence' },
        latitude: { type: 'number', example: -6.7924 },
        longitude: { type: 'number', example: 39.2083 },
        notes: { type: 'string', example: 'Checked in from main office' },
      },
    },
  })
  checkIn(@Body() body: any) { return firstValueFrom(this.attService.CheckIn(body)); }

  @Post('check-out')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        notes: { type: 'string', example: 'Leaving for the day' },
      },
    },
  })
  checkOut(@Body() body: any) { return firstValueFrom(this.attService.CheckOut(body)); }

  @Get('records')
  listRecords(@Query() query: any) { return firstValueFrom(this.attService.ListRecords(query)); }

  @Get('records/today/:companyId')
  today(@Param('companyId') companyId: string) { return firstValueFrom(this.attService.GetTodayAttendance({ companyId })); }

  @Post('bulk-mark')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'employeeIds', 'date', 'status'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        employeeIds: { type: 'array', items: { type: 'string' }, example: ['emp-001', 'emp-002', 'emp-003'] },
        date: { type: 'string', example: '2024-06-15' },
        status: { type: 'string', example: 'present' },
        reason: { type: 'string', example: 'Company-wide training day' },
      },
    },
  })
  bulkMark(@Body() body: any) { return firstValueFrom(this.attService.BulkMarkAttendance(body)); }

  // Exceptions
  @Post('exceptions')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'date', 'type'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        date: { type: 'string', example: '2024-06-15' },
        type: { type: 'string', example: 'late_arrival' },
        description: { type: 'string', example: 'Traffic jam on Morogoro Road caused 30-minute delay' },
      },
    },
  })
  createException(@Body() body: any) { return firstValueFrom(this.excService.CreateException(body)); }

  @Get('exceptions')
  listExceptions(@Query() query: any) { return firstValueFrom(this.excService.ListExceptions(query)); }

  @Post('exceptions/:id/resolve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['resolution', 'approvedBy'],
      properties: {
        resolution: { type: 'string', example: 'approved' },
        notes: { type: 'string', example: 'Valid reason confirmed with manager' },
        approvedBy: { type: 'string', example: 'mgr-001' },
      },
    },
  })
  resolveException(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.excService.ResolveException({ id, ...body })); }

  // Shifts
  @Post('shifts')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'startTime', 'endTime'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        name: { type: 'string', example: 'Morning Shift' },
        startTime: { type: 'string', example: '08:00' },
        endTime: { type: 'string', example: '17:00' },
        breakMinutes: { type: 'number', example: 60 },
      },
    },
  })
  createShift(@Body() body: any) { return firstValueFrom(this.shiftService.CreateShift(body)); }

  @Get('shifts')
  listShifts(@Query() query: any) { return firstValueFrom(this.shiftService.ListShifts(query)); }

  @Post('shifts/assign')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['shiftId', 'employeeIds', 'startDate'],
      properties: {
        shiftId: { type: 'string', example: 'shift-001' },
        employeeIds: { type: 'array', items: { type: 'string' }, example: ['emp-001', 'emp-002'] },
        startDate: { type: 'string', example: '2024-07-01' },
        endDate: { type: 'string', example: '2024-07-31' },
      },
    },
  })
  assignShift(@Body() body: any) { return firstValueFrom(this.shiftService.AssignShift(body)); }

  // Overtime
  @Post('overtime')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'date', 'hours', 'reason'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        date: { type: 'string', example: '2024-06-15' },
        hours: { type: 'number', example: 3.5 },
        reason: { type: 'string', example: 'Urgent server migration project deadline' },
        approvedBy: { type: 'string', example: 'mgr-001' },
      },
    },
  })
  createOT(@Body() body: any) { return firstValueFrom(this.otService.CreateOvertime(body)); }

  @Get('overtime')
  listOT(@Query() query: any) { return firstValueFrom(this.otService.ListOvertime(query)); }

  @Post('overtime/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approved', 'approvedBy'],
      properties: {
        approved: { type: 'boolean', example: true },
        approvedBy: { type: 'string', example: 'mgr-001' },
        notes: { type: 'string', example: 'Approved - project deadline is critical' },
      },
    },
  })
  approveOT(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.otService.ApproveOvertime({ id, ...body })); }

  // Geofences
  @Post('geofences')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'latitude', 'longitude', 'radiusMeters'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        name: { type: 'string', example: 'Head Office - Dar es Salaam' },
        latitude: { type: 'number', example: -6.7924 },
        longitude: { type: 'number', example: 39.2083 },
        radiusMeters: { type: 'number', example: 200 },
      },
    },
  })
  createGF(@Body() body: any) { return firstValueFrom(this.gfService.CreateGeofence(body)); }

  @Get('geofences')
  listGF(@Query() query: any) { return firstValueFrom(this.gfService.ListGeofences(query)); }

  // Approvals
  @Post('approvals')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'type', 'status', 'approvedBy'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        type: { type: 'string', example: 'overtime' },
        status: { type: 'string', example: 'pending' },
        approvedBy: { type: 'string', example: 'mgr-001' },
        notes: { type: 'string', example: 'Awaiting department head approval' },
      },
    },
  })
  createAppr(@Body() body: any) { return firstValueFrom(this.apprService.CreateApproval(body)); }

  @Get('approvals')
  listAppr(@Query() query: any) { return firstValueFrom(this.apprService.ListApprovals(query)); }
}
