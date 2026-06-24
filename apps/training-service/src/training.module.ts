import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { ProgramService } from './programs/programs.service';
import { EnrollmentService } from './enrollments/enrollments.service';
import { CertificationService } from './certifications/certifications.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [ProgramService, EnrollmentService, CertificationService],
  exports: [ProgramService, EnrollmentService, CertificationService],
})
export class TrainingModule {}
