import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { EmployeeController } from './employees/employees.controller';
import { DocumentController } from './documents/documents.controller';
import { QualificationController } from './qualifications/qualifications.controller';
import { EmergencyContactController } from './emergency-contacts/emergency-contacts.controller';
import { FamilyController } from './family/family.controller';
import { EmployeeService } from './employees/employees.service';
import { DocumentService } from './documents/documents.service';
import { QualificationService } from './qualifications/qualifications.service';
import { EmergencyContactService } from './emergency-contacts/emergency-contacts.service';
import { FamilyService } from './family/family.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('employee')],
  controllers: [EmployeeController, DocumentController, QualificationController, EmergencyContactController, FamilyController],
  providers: [EmployeeService, DocumentService, QualificationService, EmergencyContactService, FamilyService],
})
export class AppModule {}
