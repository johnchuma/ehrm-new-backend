import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AnnouncementController } from './announcements/announcements.controller';
import { AnnouncementService } from './announcements/announcements.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('announcements')],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
})
export class AppModule {}
