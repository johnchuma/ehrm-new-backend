import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { PayrollRunService } from './payroll-runs/payroll-runs.service';
import { AdvanceService } from './salary-advance/salary-advance.service';
import { DeductionService } from './deductions/deductions.service';
import { AllowanceService } from './allowances/allowances.service';
import { BonusService } from './bonuses/bonuses.service';
import { SettlementService } from './settlements/settlements.service';
import { JournalService } from './journal/journal.service';

const SERVICE_NAME = 'payroll';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: (client: any) => client,
      inject: [prismaToken(SERVICE_NAME)],
    },
    PayrollRunService,
    AdvanceService,
    DeductionService,
    AllowanceService,
    BonusService,
    SettlementService,
    JournalService,
  ],
  exports: [PayrollRunService, AdvanceService, DeductionService, AllowanceService, BonusService, SettlementService, JournalService],
})
export class PayrollModule {}
