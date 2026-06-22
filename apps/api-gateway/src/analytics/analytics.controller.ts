import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  private service: any;

  constructor(@Inject(GRPC_SERVICES.ANALYTICS) private readonly client: ClientGrpc) {}

  onModuleInit() { this.service = this.client.getService('AnalyticsService'); }

  @Get('dashboard/:companyId')
  dashboard(@Param('companyId') companyId: string) { return firstValueFrom(this.service.GetDashboard({ companyId })); }

  @Get('headcount/:companyId')
  headcount(@Param('companyId') companyId: string) { return firstValueFrom(this.service.GetHeadcountAnalytics({ companyId })); }

  @Get('attendance/:companyId')
  attendance(@Param('companyId') companyId: string) { return firstValueFrom(this.service.GetAttendanceAnalytics({ companyId })); }

  @Get('leave/:companyId')
  leave(@Param('companyId') companyId: string) { return firstValueFrom(this.service.GetLeaveAnalytics({ companyId })); }

  @Get('payroll/:companyId')
  payroll(@Param('companyId') companyId: string) { return firstValueFrom(this.service.GetPayrollAnalytics({ companyId })); }
}
