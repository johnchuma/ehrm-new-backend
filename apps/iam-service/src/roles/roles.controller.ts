import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RoleService } from './roles.service';

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @GrpcMethod('RoleService', 'CreateRole')
  async createRole(data: any) {
    return this.roleService.createRole(data);
  }

  @GrpcMethod('RoleService', 'GetRole')
  async getRole(data: { id: string }) {
    return this.roleService.getRole(data.id);
  }

  @GrpcMethod('RoleService', 'UpdateRole')
  async updateRole(data: { id: string; name?: string; description?: string; permissionIds?: string[] }) {
    return this.roleService.updateRole(data.id, data);
  }

  @GrpcMethod('RoleService', 'DeleteRole')
  async deleteRole(data: { id: string }) {
    return this.roleService.deleteRole(data.id);
  }

  @GrpcMethod('RoleService', 'ListRoles')
  async listRoles(data: { companyId: string }) {
    return this.roleService.listRoles(data.companyId);
  }

  @GrpcMethod('RoleService', 'AssignPermission')
  async assignPermission(data: { roleId: string; permissionId: string }) {
    return this.roleService.assignPermission(data.roleId, data.permissionId);
  }
}
