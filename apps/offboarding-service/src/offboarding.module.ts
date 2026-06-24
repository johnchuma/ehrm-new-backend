import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { OffboardingService } from './offboarding/offboarding.service';
import { ClearanceService } from './clearance/clearance.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [OffboardingService, ClearanceService],
  exports: [OffboardingService, ClearanceService],
})
export class OffboardingModule {}
