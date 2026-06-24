import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { BenefitService } from './benefits/benefits.service';
import { EnrollmentService } from './enrollments/enrollments.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [BenefitService, EnrollmentService],
  exports: [BenefitService, EnrollmentService],
})
export class BenefitsModule {}
