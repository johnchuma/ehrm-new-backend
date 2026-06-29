import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { SuperAdminService } from './super-admin.service';
import { SecurityService } from './security.service';
import { SubscriptionAdminService } from './subscriptions.service';
import { SuperAdminController, AdminImpersonationController } from './super-admin.controller';

@Module({
  imports: [AuthModule],
  controllers: [SuperAdminController, AdminImpersonationController],
  providers: [SuperAdminService, SecurityService, SubscriptionAdminService],
})
export class SuperAdminModule {}
