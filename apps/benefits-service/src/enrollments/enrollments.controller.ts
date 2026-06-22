import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EnrollmentService } from './enrollments.service';

@Controller()
export class EnrollmentController {
  constructor(private readonly service: EnrollmentService) {}

  @GrpcMethod('BenefitEnrollmentService', 'EnrollEmployee')
  enroll(data: any) { return this.service.enroll(data); }

  @GrpcMethod('BenefitEnrollmentService', 'ListEnrollments')
  list(data: { companyId?: string; employeeId?: string }) { return this.service.list(data.companyId, data.employeeId); }
}
