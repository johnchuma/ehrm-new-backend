import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { OffboardingService } from './offboarding/offboarding.service';
import { ClearanceService } from './clearance/clearance.service';

const SERVICE_NAME = 'offboarding';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    OffboardingService, ClearanceService,
  ],
  exports: [OffboardingService, ClearanceService],
})
export class OffboardingModule {}
