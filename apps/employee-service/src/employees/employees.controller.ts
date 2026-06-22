import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EmployeeService } from './employees.service';

@Controller()
export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  @GrpcMethod('EmployeeService', 'CreateEmployee')
  create(data: any) { return this.service.createEmployee(data); }

  @GrpcMethod('EmployeeService', 'GetEmployee')
  get(data: { id: string }) { return this.service.getEmployee(data.id); }

  @GrpcMethod('EmployeeService', 'GetEmployeeProfile')
  getProfile(data: { id: string }) { return this.service.getEmployeeProfile(data.id); }

  @GrpcMethod('EmployeeService', 'UpdateEmployee')
  update(data: { id: string } & any) { return this.service.updateEmployee(data.id, data); }

  @GrpcMethod('EmployeeService', 'DeleteEmployee')
  remove(data: { id: string }) { return this.service.deleteEmployee(data.id); }

  @GrpcMethod('EmployeeService', 'ListEmployees')
  list(data: { companyId: string; departmentId?: string; branchId?: string; status?: string; page?: number; pageSize?: number; search?: string }) {
    return this.service.listEmployees(data.companyId, data);
  }

  @GrpcMethod('EmployeeService', 'AdvanceApproval')
  advance(data: { id: string }) { return this.service.advanceApproval(data.id); }

  @GrpcMethod('EmployeeService', 'ApproveEmployee')
  approve(data: { id: string }) { return this.service.approveEmployee(data.id); }
}
