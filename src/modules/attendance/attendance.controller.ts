import { Controller, Get, Post, Body, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
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
  @ApiOperation({ summary: 'Check in for today' })
  checkIn(@CurrentUser() user: any) {
    return this.svc.checkIn(user.sub);
  }

  @Post('me/checkout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Check out for today' })
  checkOut(@CurrentUser() user: any) {
    return this.svc.checkOut(user.sub);
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
}
