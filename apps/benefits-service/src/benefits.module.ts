import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { BenefitService } from './benefits/benefits.service';
import { EnrollmentService } from './enrollments/enrollments.service';

const SERVICE_NAME = 'benefits';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    BenefitService, EnrollmentService,
  ],
  exports: [BenefitService, EnrollmentService],
})
export class BenefitsModule {}
