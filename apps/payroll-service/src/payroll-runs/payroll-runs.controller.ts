import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PayrollRunService } from './payroll-runs.service';

@Controller()
export class PayrollRunController {
  constructor(private readonly service: PayrollRunService) {}

  @GrpcMethod('PayrollRunService', 'GeneratePayroll')
  generate(data: any) { return this.service.generate(data); }

  @GrpcMethod('PayrollRunService', 'GetRun')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('PayrollRunService', 'GetRunDetails')
  getDetails(data: { id: string }) { return this.service.getDetails(data.id); }

  @GrpcMethod('PayrollRunService', 'ListRuns')
  list(data: { companyId: string; year?: string; status?: string; page?: number; pageSize?: number }) {
    return this.service.list(data.companyId, data);
  }

  @GrpcMethod('PayrollRunService', 'ApproveRun')
  approve(data: { id: string; approverId: string }) { return this.service.approve(data.id, data.approverId); }

  @GrpcMethod('PayrollRunService', 'PublishPayslips')
  publish(data: { id: string }) { return this.service.publishPayslips(data.id); }
}
