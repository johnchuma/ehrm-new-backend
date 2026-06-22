import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { ComplianceController } from './compliance/compliance.controller';
import { StatutoryController } from './statutory/statutory.controller';
import { ComplianceService } from './compliance/compliance.service';
import { StatutoryService } from './statutory/statutory.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('compliance')],
  controllers: [ComplianceController, StatutoryController],
  providers: [ComplianceService, StatutoryService],
})
export class AppModule {}
