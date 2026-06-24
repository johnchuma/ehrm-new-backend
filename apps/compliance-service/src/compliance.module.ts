import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { ComplianceService } from './compliance/compliance.service';
import { StatutoryService } from './statutory/statutory.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [ComplianceService, StatutoryService],
  exports: [ComplianceService, StatutoryService],
})
export class ComplianceModule {}
