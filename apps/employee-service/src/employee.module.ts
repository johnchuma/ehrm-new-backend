import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { EmployeeService } from './employees/employees.service';
import { DocumentService } from './documents/documents.service';
import { QualificationService } from './qualifications/qualifications.service';
import { EmergencyContactService } from './emergency-contacts/emergency-contacts.service';
import { FamilyService } from './family/family.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [EmployeeService, DocumentService, QualificationService, EmergencyContactService, FamilyService],
  exports: [EmployeeService, DocumentService, QualificationService, EmergencyContactService, FamilyService],
})
export class EmployeeModule {}
