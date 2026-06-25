import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController, AdminImpersonationController } from './super-admin.controller';

@Module({
  imports: [AuthModule],
  controllers: [SuperAdminController, AdminImpersonationController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
