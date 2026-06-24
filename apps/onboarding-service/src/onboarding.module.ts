import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { OnboardingService } from './onboarding/onboarding.service';
import { OnboardingTaskService } from './tasks/tasks.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [OnboardingService, OnboardingTaskService],
  exports: [OnboardingService, OnboardingTaskService],
})
export class OnboardingModule {}
