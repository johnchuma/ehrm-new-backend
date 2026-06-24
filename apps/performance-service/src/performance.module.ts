import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { ReviewService } from './reviews/reviews.service';
import { GoalService } from './goals/goals.service';
import { KpiService } from './kpis/kpis.service';

const SERVICE_NAME = 'performance';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    ReviewService, GoalService, KpiService,
  ],
  exports: [ReviewService, GoalService, KpiService],
})
export class PerformanceModule {}
