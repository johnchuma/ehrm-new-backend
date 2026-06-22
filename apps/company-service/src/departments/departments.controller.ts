import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DepartmentService } from './departments.service';

@Controller()
export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}

  @GrpcMethod('DepartmentService', 'CreateDepartment')
  create(data: any) { return this.service.createDepartment(data); }

  @GrpcMethod('DepartmentService', 'GetDepartment')
  get(data: { id: string }) { return this.service.getDepartment(data.id); }

  @GrpcMethod('DepartmentService', 'UpdateDepartment')
  update(data: { id: string } & any) { return this.service.updateDepartment(data.id, data); }

  @GrpcMethod('DepartmentService', 'DeleteDepartment')
  remove(data: { id: string }) { return this.service.deleteDepartment(data.id); }

  @GrpcMethod('DepartmentService', 'ListDepartments')
  list(data: { companyId: string; branchId?: string }) { return this.service.listDepartments(data.companyId, data.branchId); }
}
