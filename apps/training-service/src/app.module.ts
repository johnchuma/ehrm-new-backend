import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { ProgramController } from './programs/programs.controller';
import { EnrollmentController } from './enrollments/enrollments.controller';
import { CertificationController } from './certifications/certifications.controller';
import { ProgramService } from './programs/programs.service';
import { EnrollmentService } from './enrollments/enrollments.service';
import { CertificationService } from './certifications/certifications.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('training')],
  controllers: [ProgramController, EnrollmentController, CertificationController],
  providers: [ProgramService, EnrollmentService, CertificationService],
})
export class AppModule {}
