import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from '../notifications/email.service';
import { SmsService } from '../notifications/sms.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'ehrm-super-secret-key-2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, SmsService],
})
export class AuthModule {}
