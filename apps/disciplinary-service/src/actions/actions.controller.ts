import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ActionService } from './actions.service';

@Controller()
export class ActionController {
  constructor(private readonly service: ActionService) {}

  @GrpcMethod('DisciplinaryActionService', 'CreateAction')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('DisciplinaryActionService', 'ApproveAction')
  approve(data: { id: string; status: string }) { return this.service.approve(data.id, data.status); }

  @GrpcMethod('DisciplinaryActionService', 'ListActions')
  list(data: { caseId: string }) { return this.service.list(data.caseId); }
}
