import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { BenefitController } from './benefits/benefits.controller';
import { EnrollmentController } from './enrollments/enrollments.controller';
import { BenefitService } from './benefits/benefits.service';
import { EnrollmentService } from './enrollments/enrollments.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('benefits')],
  controllers: [BenefitController, EnrollmentController],
  providers: [BenefitService, EnrollmentService],
})
export class AppModule {}
