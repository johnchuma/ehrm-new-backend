import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { SalaryIntelligenceService } from './salary-intelligence/salary-intelligence.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [SalaryIntelligenceService],
  exports: [SalaryIntelligenceService],
})
export class SalaryIntelligenceModule {}
