import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IamService } from './iam.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcryptjs';

@ApiTags('IAM - Users & Roles')
@ApiBearerAuth()
@Controller('iam')
export class IamController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly iam: IamService,
  ) {}

  // ── Users ──

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async listUsers(@Query() query: any) {
    const users = await this.prisma.user.findMany({
      where: query.companyId ? { companyId: query.companyId } : {},
      include: { roles: { include: { role: true } } },
    });
    return { users };
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() body: CreateUserDto) {
    const hashed = await bcrypt.hash(body.password || 'demo1234', 12);
    const user = await this.prisma.user.create({
      data: {
        email: (body.email || '').toLowerCase(),
        password: hashed,
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        fullName: `${body.firstName || ''} ${body.lastName || ''}`.trim() || body.email,
        companyId: body.companyId || '',
        isActive: true,
        role: 'Employee',
      },
    });
    return { ...user };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    return user;
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const data: any = {};
    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.email !== undefined) data.email = body.email?.toLowerCase();
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.firstName || body.lastName) {
      const current = await this.prisma.user.findUnique({ where: { id } });
      data.fullName = `${body.firstName || current?.firstName || ''} ${body.lastName || current?.lastName || ''}`.trim();
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // ── Roles ──

  @Get('roles')
  @ApiOperation({ summary: 'List roles (filter by companyId for company-specific roles)' })
  async listRoles(@Query('companyId') companyId?: string) {
    return this.iam.listRoles(companyId || undefined);
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  async getRole(@Param('id') id: string) {
    return this.iam.getRole(id);
  }

  @Post('roles')
  @ApiOperation({ summary: 'Create a company role' })
  async createRole(@Body() body: { name: string; description?: string; companyId?: string; permissionNames?: string[] }) {
    return this.iam.createRole(body);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update role name, description, or permissions' })
  async updateRole(@Param('id') id: string, @Body() body: { name?: string; description?: string; permissionNames?: string[] }) {
    return this.iam.updateRole(id, body);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete a company role (cannot delete system roles)' })
  async deleteRole(@Param('id') id: string) {
    return this.iam.deleteRole(id);
  }

  // ── User-Role Assignment ──

  @Post('users/:userId/roles')
  @ApiOperation({ summary: 'Assign a role to a user' })
  async assignRole(@Param('userId') userId: string, @Body() body: { roleId: string }) {
    return this.iam.assignRole(userId, body.roleId);
  }

  @Delete('users/:userId/roles/:roleId')
  @ApiOperation({ summary: 'Remove a role from a user' })
  async removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.iam.removeRole(userId, roleId);
  }

  @Get('users/:userId/roles')
  @ApiOperation({ summary: 'Get all roles for a user' })
  async getUserRoles(@Param('userId') userId: string) {
    return this.iam.getUserRoles(userId);
  }

  // ── Permissions ──

  @Get('permissions')
  @ApiOperation({ summary: 'List all available permissions' })
  async listPermissions() {
    return this.iam.listPermissions();
  }
}
