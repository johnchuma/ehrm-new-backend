import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { PayrollRunService } from './payroll-runs/payroll-runs.service';
import { AdvanceService } from './salary-advance/salary-advance.service';
import { DeductionService } from './deductions/deductions.service';
import { AllowanceService } from './allowances/allowances.service';
import { BonusService } from './bonuses/bonuses.service';
import { SettlementService } from './settlements/settlements.service';
import { JournalService } from './journal/journal.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [PayrollRunService, AdvanceService, DeductionService, AllowanceService, BonusService, SettlementService, JournalService],
  exports: [PayrollRunService, AdvanceService, DeductionService, AllowanceService, BonusService, SettlementService, JournalService],
})
export class PayrollModule {}
