import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TaskService } from './tasks.service';

@Controller()
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @GrpcMethod('TaskService', 'CreateTask')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('TaskService', 'GetTask')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('TaskService', 'UpdateTask')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('TaskService', 'DeleteTask')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('TaskService', 'AssignTask')
  assign(data: { id: string; assigneeId: string }) { return this.service.assign(data.id, data.assigneeId); }

  @GrpcMethod('TaskService', 'CompleteTask')
  complete(data: { id: string }) { return this.service.complete(data.id); }

  @GrpcMethod('TaskService', 'ListTasks')
  list(data: { companyId: string; assigneeId?: string; status?: string; priority?: string }) {
    return this.service.list(data.companyId, data);
  }
}
