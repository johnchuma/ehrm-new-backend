import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { NotificationService } from './notifications/notifications.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
