import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { ComplianceService } from './compliance/compliance.service';
import { StatutoryService } from './statutory/statutory.service';

const SERVICE_NAME = 'compliance';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    ComplianceService, StatutoryService,
  ],
  exports: [ComplianceService, StatutoryService],
})
export class ComplianceModule {}
