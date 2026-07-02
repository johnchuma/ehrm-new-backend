import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/prisma/prisma.module';
import { ApprovalsModule } from '../approvals/approvals.module';
import { AttendanceAdminController } from './attendance-admin.controller';
import { AttendanceAdminService } from './attendance-admin.service';

@Module({
  imports: [PrismaModule, ApprovalsModule],
  controllers: [AttendanceAdminController],
  providers: [AttendanceAdminService],
  exports: [AttendanceAdminService],
})
export class AttendanceAdminModule {}