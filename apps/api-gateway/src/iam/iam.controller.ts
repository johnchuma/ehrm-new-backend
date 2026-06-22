import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('IAM - Users & Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('iam')
export class IamController {
  private userService: any;
  private roleService: any;

  constructor(@Inject(GRPC_SERVICES.IAM) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService('UserService');
    this.roleService = this.client.getService('RoleService');
  }

  // Users
  @Post('users')
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'phone', 'password', 'firstName', 'lastName', 'companyId', 'role'],
      properties: {
        email: { type: 'string', example: 'john.makamba@acacia.co.tz' },
        phone: { type: 'string', example: '+255712345678' },
        password: { type: 'string', example: 'P@ssw0rd123' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Makamba' },
        companyId: { type: 'string', example: 'cmp_9f8e7d6c5b4a' },
        role: { type: 'string', example: 'admin' },
      },
    },
  })
  createUser(@Body() body: any) { return firstValueFrom(this.userService.CreateUser(body)); }

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  listUsers(@Query() query: any) { return firstValueFrom(this.userService.ListUsers(query)); }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  getUser(@Param('id') id: string) { return firstValueFrom(this.userService.GetUser({ id })); }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john.makamba@acacia.co.tz' },
        phone: { type: 'string', example: '+255712345678' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Makamba' },
        role: { type: 'string', example: 'manager' },
        status: { type: 'string', example: 'active' },
      },
    },
  })
  updateUser(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.userService.UpdateUser({ id, ...body })); }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  deleteUser(@Param('id') id: string) { return firstValueFrom(this.userService.DeleteUser({ id })); }

  @Post('users/:userId/roles/:roleId')
  @ApiOperation({ summary: 'Assign role to user' })
  assignRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return firstValueFrom(this.userService.AssignRole({ userId, roleId }));
  }

  @Delete('users/:userId/roles/:roleId')
  @ApiOperation({ summary: 'Remove role from user' })
  removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return firstValueFrom(this.userService.RemoveRole({ userId, roleId }));
  }

  // Roles
  @Post('roles')
  @ApiOperation({ summary: 'Create role' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'description', 'permissions'],
      properties: {
        name: { type: 'string', example: 'HR Manager' },
        description: { type: 'string', example: 'Manages human resources operations and employee records' },
        permissions: { type: 'array', items: { type: 'string' }, example: ['users.read', 'users.write', 'departments.read'] },
      },
    },
  })
  createRole(@Body() body: any) { return firstValueFrom(this.roleService.CreateRole(body)); }

  @Get('roles')
  @ApiOperation({ summary: 'List roles' })
  listRoles(@Query() query: any) { return firstValueFrom(this.roleService.ListRoles(query)); }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  getRole(@Param('id') id: string) { return firstValueFrom(this.roleService.GetRole({ id })); }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update role' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Senior HR Manager' },
        description: { type: 'string', example: 'Senior role managing all human resources operations' },
        permissions: { type: 'array', items: { type: 'string' }, example: ['users.read', 'users.write', 'users.delete', 'departments.read', 'departments.write'] },
      },
    },
  })
  updateRole(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.roleService.UpdateRole({ id, ...body })); }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete role' })
  deleteRole(@Param('id') id: string) { return firstValueFrom(this.roleService.DeleteRole({ id })); }
}
