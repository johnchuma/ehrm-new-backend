import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Employee dashboard summary — attendance today, leave balances, pending tasks, announcements, etc.',
  })
  getEmployeeDashboard(@CurrentUser() user: any) {
    return this.svc.getEmployeeDashboard(user.sub);
  }

  @Get('directory')
  @ApiOperation({ summary: 'Company employee directory (search by name or department)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @RequirePermissions('employees.read')
  getDirectory(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.svc.getDirectory(user.companyId, search, departmentId);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Admin dashboard overview — aggregated KPIs for the company' })
  @RequirePermissions('analytics.read')
  getOverview(@CurrentUser() user: any, @Query('month') month?: number, @Query('year') year?: number) {
    return this.svc.getOverview(user.companyId, month ? Number(month) : undefined, year ? Number(year) : undefined);
  }

  @Get('analytics')
  @ApiOperation({
    summary:
      'Analytics view — KPI strip, headcount/attendance trends, approval queue, attendance command, shift/payroll readiness, system health',
  })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  @RequirePermissions('analytics.read')
  getAnalytics(@CurrentUser() user: any, @Query('month') month?: number, @Query('year') year?: number) {
    return this.svc.getAnalytics(
      user.companyId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }
}
