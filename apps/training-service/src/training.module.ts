import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { ProgramService } from './programs/programs.service';
import { EnrollmentService } from './enrollments/enrollments.service';
import { CertificationService } from './certifications/certifications.service';

const SERVICE_NAME = 'training';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    ProgramService, EnrollmentService, CertificationService,
  ],
  exports: [ProgramService, EnrollmentService, CertificationService],
})
export class TrainingModule {}
