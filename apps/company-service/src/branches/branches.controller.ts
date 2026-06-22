import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BranchService } from './branches.service';

@Controller()
export class BranchController {
  constructor(private readonly service: BranchService) {}

  @GrpcMethod('BranchService', 'CreateBranch')
  create(data: any) { return this.service.createBranch(data); }

  @GrpcMethod('BranchService', 'GetBranch')
  get(data: { id: string }) { return this.service.getBranch(data.id); }

  @GrpcMethod('BranchService', 'UpdateBranch')
  update(data: { id: string } & any) { return this.service.updateBranch(data.id, data); }

  @GrpcMethod('BranchService', 'DeleteBranch')
  remove(data: { id: string }) { return this.service.deleteBranch(data.id); }

  @GrpcMethod('BranchService', 'ListBranches')
  list(data: { companyId: string }) { return this.service.listBranches(data.companyId); }
}
