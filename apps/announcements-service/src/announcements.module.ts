import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AnnouncementService } from './announcements/announcements.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [AnnouncementService],
  exports: [AnnouncementService],
})
export class AnnouncementsModule {}
