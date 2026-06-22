import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EnrollmentService } from './enrollments.service';

@Controller()
export class EnrollmentController {
  constructor(private readonly service: EnrollmentService) {}

  @GrpcMethod('EnrollmentService', 'EnrollEmployee')
  enroll(data: any) { return this.service.enroll(data); }

  @GrpcMethod('EnrollmentService', 'UpdateEnrollment')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('EnrollmentService', 'ListEnrollments')
  list(data: { programId?: string; employeeId?: string }) { return this.service.list(data.programId, data.employeeId); }
}
