import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { EmployeeService } from './employees/employees.service';
import { DocumentService } from './documents/documents.service';
import { QualificationService } from './qualifications/qualifications.service';
import { EmergencyContactService } from './emergency-contacts/emergency-contacts.service';
import { FamilyService } from './family/family.service';

const SERVICE_NAME = 'employee';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: (client: any) => client,
      inject: [prismaToken(SERVICE_NAME)],
    },
    EmployeeService,
    DocumentService,
    QualificationService,
    EmergencyContactService,
    FamilyService,
  ],
  exports: [EmployeeService, DocumentService, QualificationService, EmergencyContactService, FamilyService],
})
export class EmployeeModule {}
