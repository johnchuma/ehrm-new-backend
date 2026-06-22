import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ContractService } from './contracts.service';

@Controller()
export class ContractController {
  constructor(private readonly service: ContractService) {}

  @GrpcMethod('ContractService', 'CreateContract')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('ContractService', 'GetContract')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('ContractService', 'UpdateContract')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('ContractService', 'TerminateContract')
  terminate(data: { id: string; reason: string; terminationDate: string }) { return this.service.terminate(data.id, data.reason, data.terminationDate); }

  @GrpcMethod('ContractService', 'RenewContract')
  renew(data: { id: string; newEndDate: string; newSalary: number }) { return this.service.renew(data.id, data.newEndDate, data.newSalary); }

  @GrpcMethod('ContractService', 'ListContracts')
  list(data: { companyId: string; employeeId?: string; status?: string }) { return this.service.list(data.companyId, data); }
}
