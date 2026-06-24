import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { OnboardingService } from './onboarding/onboarding.service';
import { OnboardingTaskService } from './tasks/tasks.service';

const SERVICE_NAME = 'onboarding';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    OnboardingService, OnboardingTaskService,
  ],
  exports: [OnboardingService, OnboardingTaskService],
})
export class OnboardingModule {}
