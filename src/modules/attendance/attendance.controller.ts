import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService, ClockInDto, ClockOutDto } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly svc: AttendanceService) {}

  @Get('me/today')
  @ApiOperation({ summary: "Get today's attendance status" })
  getTodayStatus(@CurrentUser() user: any) {
    return this.svc.getTodayStatus(user.sub);
  }

  @Post('me/checkin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Check in for today (accepts GPS latitude/longitude/source)' })
  checkIn(@CurrentUser() user: any, @Body() body: ClockInDto) {
    return this.svc.checkIn(user.sub, body);
  }

  @Post('me/checkout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Check out for today' })
  checkOut(@CurrentUser() user: any, @Body() body: ClockOutDto) {
    return this.svc.checkOut(user.sub, body);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my attendance records' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getMyAttendance(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.svc.getMyAttendanceSummary(
      user.sub,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('team')
  @ApiOperation({ summary: '[MSS] Get team attendance for a date' })
  @ApiQuery({ name: 'date', required: false, description: 'ISO date (YYYY-MM-DD), defaults to today' })
  getTeamAttendance(@CurrentUser() user: any, @Query('date') date?: string) {
    return this.svc.getTeamAttendance(user.sub, date);
  }

  // Reference-compatible aliases (portal frontend paths)

  @Post('clock-in')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clock in (alias of /attendance/me/checkin, accepts GPS)' })
  clockIn(@CurrentUser() user: any, @Body() body: ClockInDto) {
    return this.svc.checkIn(user.sub, body);
  }

  @Post('clock-out/:employeeId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clock out (alias of /attendance/me/checkout)' })
  clockOut(@CurrentUser() user: any, @Body() body: ClockOutDto) {
    return this.svc.checkOut(user.sub, body);
  }

  @Get('clock-in/preflight/:employeeId')
  @ApiOperation({ summary: 'Pre-clock-in check: today status, schedule, geofence locations' })
  preflight(@CurrentUser() user: any, @Param('employeeId') employeeId: string) {
    return this.svc.getPreflight(user.sub, employeeId);
  }

  @Get('time-history/:employeeId')
  @ApiOperation({ summary: 'Paginated attendance history with a range summary' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  timeHistory(
    @CurrentUser() user: any,
    @Param('employeeId') employeeId: string,
    @Query('year') year?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.svc.getTimeHistory(user.sub, employeeId, {
      year: year ? parseInt(year) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      startDate,
      endDate,
    });
  }

  @Post('report/summary')
  @HttpCode(200)
  @ApiOperation({ summary: '[MSS] Team attendance report summary over a date range' })
  reportSummary(
    @CurrentUser() user: any,
    @Body() body: { startDate?: string; endDate?: string; departmentId?: string; userIds?: string[] },
  ) {
    return this.svc.getReportSummary(user.sub, body);
  }
}
