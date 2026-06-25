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

@Module({
  imports: [PrismaModule, AuthModule, CompanyModule, SubscriptionsModule, DemoModule, AiModule, NotificationsModule, EmployeeModule],
  controllers: [IamController],
  providers: [IamService],
})
export class AppModule {}
