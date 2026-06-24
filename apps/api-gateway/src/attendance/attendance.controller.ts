import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttendanceService } from '../../../attendance-service/src/attendance/attendance.service';
import { ExceptionService } from '../../../attendance-service/src/exceptions/exceptions.service';
import { ShiftService } from '../../../attendance-service/src/shifts/shifts.service';
import { SwapService } from '../../../attendance-service/src/swap-requests/swap.service';
import { OvertimeService } from '../../../attendance-service/src/overtime/overtime.service';
import { GeofenceService } from '../../../attendance-service/src/geofencing/geofencing.service';
import { ApprovalService } from '../../../attendance-service/src/attendance/approvals.service';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attService: AttendanceService,
    private readonly excService: ExceptionService,
    private readonly shiftService: ShiftService,
    private readonly swapService: SwapService,
    private readonly otService: OvertimeService,
    private readonly gfService: GeofenceService,
    private readonly apprService: ApprovalService,
  ) {}

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
  checkIn(@Body() body: any) { return this.attService.checkIn(body); }

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
  checkOut(@Body() body: any) { return this.attService.checkOut(body); }

  @Get('records')
  listRecords(@Query() query: any) { return this.attService.listRecords(query.companyId, query); }

  @Get('records/today/:companyId')
  today(@Param('companyId') companyId: string) { return this.attService.getTodayAttendance(companyId); }

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
  bulkMark(@Body() body: any) { return this.attService.bulkMark(body); }

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
  createException(@Body() body: any) { return this.excService.create(body); }

  @Get('exceptions')
  listExceptions(@Query() query: any) { return this.excService.list(query.companyId, query.status); }

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
  resolveException(@Param('id') id: string, @Body() body: any) { return this.excService.resolve(id, body.notes); }

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
  createShift(@Body() body: any) { return this.shiftService.create(body); }

  @Get('shifts')
  listShifts(@Query() query: any) { return this.shiftService.list(query.companyId); }

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
  assignShift(@Body() body: any) { return this.shiftService.assign(body); }

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
  createOT(@Body() body: any) { return this.otService.create(body); }

  @Get('overtime')
  listOT(@Query() query: any) { return this.otService.list(query.companyId, query.status); }

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
  approveOT(@Param('id') id: string, @Body() body: any) { return this.otService.approve(id, body.approved ? 'approved' : 'rejected'); }

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
  createGF(@Body() body: any) { return this.gfService.create(body); }

  @Get('geofences')
  listGF(@Query() query: any) { return this.gfService.list(query.companyId); }

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
  createAppr(@Body() body: any) { return this.apprService.create(body); }

  @Get('approvals')
  listAppr(@Query() query: any) { return this.apprService.list(query.companyId, query.status); }
}
