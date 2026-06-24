import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { SalaryIntelligenceService } from './salary-intelligence/salary-intelligence.service';

const SERVICE_NAME = 'salary-intelligence';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    SalaryIntelligenceService,
  ],
  exports: [SalaryIntelligenceService],
})
export class SalaryIntelligenceModule {}
