import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly email: EmailService,
    private readonly sms: SmsService,
  ) {}

  @Post('email')
  @ApiOperation({ summary: 'Send an email' })
  async sendEmail(@Body() body: { to: string; subject: string; html: string }) {
    return this.email.send(body.to, body.subject, body.html);
  }

  @Post('sms')
  @ApiOperation({ summary: 'Send an SMS' })
  async sendSms(@Body() body: { to: string; message: string }) {
    return this.sms.send(body.to, body.message);
  }
}
