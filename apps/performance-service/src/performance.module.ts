import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { ReviewService } from './reviews/reviews.service';
import { GoalService } from './goals/goals.service';
import { KpiService } from './kpis/kpis.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [ReviewService, GoalService, KpiService],
  exports: [ReviewService, GoalService, KpiService],
})
export class PerformanceModule {}
