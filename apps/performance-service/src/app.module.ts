import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { ReviewController } from './reviews/reviews.controller';
import { GoalController } from './goals/goals.controller';
import { KpiController } from './kpis/kpis.controller';
import { ReviewService } from './reviews/reviews.service';
import { GoalService } from './goals/goals.service';
import { KpiService } from './kpis/kpis.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('performance')],
  controllers: [ReviewController, GoalController, KpiController],
  providers: [ReviewService, GoalService, KpiService],
})
export class AppModule {}
