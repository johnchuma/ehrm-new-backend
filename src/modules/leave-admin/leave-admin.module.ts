import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/prisma/prisma.module';
import { ApprovalsModule } from '../approvals/approvals.module';
import { LeaveAdminController } from './leave-admin.controller';
import { LeaveAdminService } from './leave-admin.service';

@Module({
  imports: [PrismaModule, ApprovalsModule],
  controllers: [LeaveAdminController],
  providers: [LeaveAdminService],
  exports: [LeaveAdminService],
})
export class LeaveAdminModule {}