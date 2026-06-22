import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { NotificationController } from './notifications/notifications.controller';
import { NotificationService } from './notifications/notifications.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('notifications')],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class AppModule {}
