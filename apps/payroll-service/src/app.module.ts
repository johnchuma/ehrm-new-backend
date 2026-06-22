import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { PayrollRunController } from './payroll-runs/payroll-runs.controller';
import { AdvanceController } from './salary-advance/salary-advance.controller';
import { DeductionController } from './deductions/deductions.controller';
import { AllowanceController } from './allowances/allowances.controller';
import { BonusController } from './bonuses/bonuses.controller';
import { SettlementController } from './settlements/settlements.controller';
import { JournalController } from './journal/journal.controller';
import { PayrollRunService } from './payroll-runs/payroll-runs.service';
import { AdvanceService } from './salary-advance/salary-advance.service';
import { DeductionService } from './deductions/deductions.service';
import { AllowanceService } from './allowances/allowances.service';
import { BonusService } from './bonuses/bonuses.service';
import { SettlementService } from './settlements/settlements.service';
import { JournalService } from './journal/journal.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('payroll')],
  controllers: [PayrollRunController, AdvanceController, DeductionController, AllowanceController, BonusController, SettlementController, JournalController],
  providers: [PayrollRunService, AdvanceService, DeductionService, AllowanceService, BonusService, SettlementService, JournalService],
})
export class AppModule {}
