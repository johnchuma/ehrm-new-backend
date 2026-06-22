import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QualificationService } from './qualifications.service';

@Controller()
export class QualificationController {
  constructor(private readonly service: QualificationService) {}

  @GrpcMethod('QualificationService', 'AddEducation')
  addEdu(data: any) { return this.service.addEducation(data); }

  @GrpcMethod('QualificationService', 'AddProfessionalQualification')
  addQual(data: any) { return this.service.addProfessionalQualification(data); }

  @GrpcMethod('QualificationService', 'ListEducation')
  listEdu(data: { employeeId: string }) { return this.service.listEducation(data.employeeId); }

  @GrpcMethod('QualificationService', 'ListQualifications')
  listQuals(data: { employeeId: string }) { return this.service.listQualifications(data.employeeId); }
}
