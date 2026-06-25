import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { EmailService } from '../notifications/email.service';

@Module({
  controllers: [DemoController],
  providers: [EmailService],
})
export class DemoModule {}
