import { Module } from '@nestjs/common';

import { PrismaModule } from '../../common/prisma/prisma.module';
import { AttendanceAdminController } from './attendance-admin.controller';
import { AttendanceAdminService } from './attendance-admin.service';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceAdminController],
  providers: [AttendanceAdminService],
  exports: [AttendanceAdminService],
})
export class AttendanceAdminModule {}