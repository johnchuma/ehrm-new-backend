import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AssignmentService } from './assignments.service';

@Controller()
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @GrpcMethod('AssetAssignmentService', 'AssignAsset')
  assign(data: any) { return this.service.assign(data); }

  @GrpcMethod('AssetAssignmentService', 'ReturnAsset')
  return(data: { id: string; returnDate: string; condition: string; notes?: string }) {
    return this.service.returnAsset(data.id, data.returnDate, data.condition, data.notes);
  }

  @GrpcMethod('AssetAssignmentService', 'ListAssignments')
  list(data: { companyId?: string; employeeId?: string }) { return this.service.list(data.companyId, data.employeeId); }
}
