import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './users.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: any) {
    return this.userService.createUser(data);
  }

  @GrpcMethod('UserService', 'GetUser')
  async getUser(data: { id: string; companyId: string }) {
    return this.userService.getUser(data.id);
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: { id: string; email?: string; phone?: string; firstName?: string; lastName?: string; isActive?: boolean; roleIds?: string[] }) {
    return this.userService.updateUser(data.id, data);
  }

  @GrpcMethod('UserService', 'DeleteUser')
  async deleteUser(data: { id: string }) {
    return this.userService.deleteUser(data.id);
  }

  @GrpcMethod('UserService', 'ListUsers')
  async listUsers(data: { companyId: string; page?: number; pageSize?: number; search?: string }) {
    return this.userService.listUsers(data.companyId, data.page || 1, data.pageSize || 20, data.search);
  }

  @GrpcMethod('UserService', 'AssignRole')
  async assignRole(data: { userId: string; roleId: string }) {
    return this.userService.assignRole(data.userId, data.roleId);
  }

  @GrpcMethod('UserService', 'RemoveRole')
  async removeRole(data: { userId: string; roleId: string }) {
    return this.userService.removeRole(data.userId, data.roleId);
  }
}
