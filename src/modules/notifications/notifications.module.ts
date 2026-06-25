import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationController } from './notification.controller';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { NotificationService } from './notification.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController, NotificationController],
  providers: [EmailService, SmsService, NotificationService],
  exports: [EmailService, SmsService, NotificationService],
})
export class NotificationsModule {}
