import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { OffboardingController } from './offboarding/offboarding.controller';
import { ClearanceController } from './clearance/clearance.controller';
import { OffboardingService } from './offboarding/offboarding.service';
import { ClearanceService } from './clearance/clearance.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('offboarding')],
  controllers: [OffboardingController, ClearanceController],
  providers: [OffboardingService, ClearanceService],
})
export class AppModule {}
