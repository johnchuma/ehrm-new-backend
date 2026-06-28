import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DemoModule } from './modules/demo/demo.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { MovementModule } from './modules/movement/movement.module';
import { SettingsModule } from './modules/settings/settings.module';
import { LeaveModule } from './modules/leave/leave.module';
import { LeaveAdminModule } from './modules/leave-admin/leave-admin.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AttendanceAdminModule } from './modules/attendance-admin/attendance-admin.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { HRQueryModule } from './modules/hrquery/hrquery.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TrainingModule } from './modules/training/training.module';
import { BenefitsModule } from './modules/benefits/benefits.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { OffboardingModule } from './modules/offboarding/offboarding.module';

import { IamController } from './modules/auth/iam.controller';
import { IamService } from './modules/auth/iam.service';

import { TenantMiddleware } from './common/tenant/tenant.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'ehrm-super-secret-key-2026',
    }),
    PrismaModule,
    AuthModule,
    CompanyModule,
    SubscriptionsModule,
    DemoModule,
    AiModule,
    NotificationsModule,
    BootstrapModule,
    SuperAdminModule,
    EmployeeModule,
    SettingsModule,
    LeaveModule,
    LeaveAdminModule,
    AttendanceModule,
    AttendanceAdminModule,
    PayrollModule,
    HRQueryModule,
    TasksModule,
    TrainingModule,
    BenefitsModule,
    ScheduleModule,
    AnnouncementsModule,
    PerformanceModule,
    ExpensesModule,
    DashboardModule,
    ContractsModule,
    OffboardingModule,
  ],
  controllers: [IamController],
  providers: [
    IamService,
    { provide: APP_FILTER,      useClass: GlobalExceptionFilter },
    { provide: APP_GUARD,       useClass: JwtAuthGuard },
    { provide: APP_GUARD,       useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
