import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CertificationService } from './certifications.service';

@Controller()
export class CertificationController {
  constructor(private readonly service: CertificationService) {}

  @GrpcMethod('CertificationService', 'IssueCertification')
  issue(data: any) { return this.service.issue(data); }

  @GrpcMethod('CertificationService', 'ListCertifications')
  list(data: { employeeId?: string; companyId?: string }) { return this.service.list(data.employeeId, data.companyId); }
}
