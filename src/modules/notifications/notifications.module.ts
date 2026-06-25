import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Module({
  controllers: [NotificationsController],
  providers: [EmailService, SmsService],
})
export class NotificationsModule {}
