import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { OffboardingController } from './offboarding.controller';
import { OffboardingService } from './offboarding.service';

@Module({
  imports: [NotificationsModule],
  controllers: [OffboardingController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class OffboardingModule {}
