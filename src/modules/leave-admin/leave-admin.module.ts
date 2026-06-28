import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/prisma/prisma.module';
import { LeaveAdminController } from './leave-admin.controller';
import { LeaveAdminService } from './leave-admin.service';

@Module({
  imports: [PrismaModule],
  controllers: [LeaveAdminController],
  providers: [LeaveAdminService],
  exports: [LeaveAdminService],
})
export class LeaveAdminModule {}