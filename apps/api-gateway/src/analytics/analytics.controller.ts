import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from '../../../analytics-service/src/analytics/analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('dashboard/:companyId')
  dashboard(@Param('companyId') companyId: string) { return this.service.getDashboard(companyId); }

  @Get('headcount/:companyId')
  headcount(@Param('companyId') companyId: string) { return this.service.getHeadcount(companyId); }

  @Get('attendance/:companyId')
  attendance(@Param('companyId') companyId: string) { return this.service.getAttendanceAnalytics(companyId); }

  @Get('leave/:companyId')
  leave(@Param('companyId') companyId: string) { return this.service.getLeaveAnalytics(companyId); }

  @Get('payroll/:companyId')
  payroll(@Param('companyId') companyId: string) { return this.service.getPayrollAnalytics(companyId); }
}
