import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { IamController } from './modules/auth/iam.controller';
import { IamService } from './modules/auth/iam.service';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DemoModule } from './modules/demo/demo.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { LeaveModule } from './modules/leave/leave.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { HRQueryModule } from './modules/hrquery/hrquery.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompanyModule,
    SubscriptionsModule,
    DemoModule,
    AiModule,
    NotificationsModule,
    EmployeeModule,
    LeaveModule,
    AttendanceModule,
    PayrollModule,
    HRQueryModule,
    TasksModule,
  ],
  controllers: [IamController],
  providers: [IamService],
})
export class AppModule {}
