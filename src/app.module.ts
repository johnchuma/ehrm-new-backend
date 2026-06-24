import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { IamController } from './modules/auth/iam.controller';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, AuthModule, CompanyModule, SubscriptionsModule],
  controllers: [IamController],
})
export class AppModule {}
