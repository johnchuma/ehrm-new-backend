import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('analytics')],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AppModule {}
