import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { SalaryIntelligenceController } from './salary-intelligence/salary-intelligence.controller';
import { SalaryIntelligenceService } from './salary-intelligence/salary-intelligence.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('salary-intelligence')],
  controllers: [SalaryIntelligenceController],
  providers: [SalaryIntelligenceService],
})
export class AppModule {}
