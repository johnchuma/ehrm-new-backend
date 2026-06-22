import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GoalService } from './goals.service';

@Controller()
export class GoalController {
  constructor(private readonly service: GoalService) {}

  @GrpcMethod('GoalService', 'CreateGoal')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('GoalService', 'GetGoal')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('GoalService', 'UpdateGoal')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('GoalService', 'DeleteGoal')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('GoalService', 'ListGoals')
  list(data: { companyId: string; employeeId?: string; status?: string }) { return this.service.list(data.companyId, data); }
}
