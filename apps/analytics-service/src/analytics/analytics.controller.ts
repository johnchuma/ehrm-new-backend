import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AnalyticsService } from './analytics.service';

@Controller()
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @GrpcMethod('AnalyticsService', 'GetDashboard')
  dashboard(data: { companyId: string }) { return this.service.getDashboard(data.companyId); }

  @GrpcMethod('AnalyticsService', 'GetHeadcountAnalytics')
  headcount(data: { companyId: string; departmentId?: string; branchId?: string }) {
    return this.service.getHeadcount(data.companyId);
  }

  @GrpcMethod('AnalyticsService', 'GetAttendanceAnalytics')
  attendance(data: { companyId: string; period?: string }) {
    return this.service.getAttendanceAnalytics(data.companyId);
  }

  @GrpcMethod('AnalyticsService', 'GetLeaveAnalytics')
  leave(data: { companyId: string; period?: string }) {
    return this.service.getLeaveAnalytics(data.companyId);
  }

  @GrpcMethod('AnalyticsService', 'GetPayrollAnalytics')
  payroll(data: { companyId: string; period?: string }) {
    return this.service.getPayrollAnalytics(data.companyId);
  }
}
