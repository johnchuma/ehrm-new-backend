import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class RoleService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async createRole(data: { name: string; description: string; companyId: string; permissionIds?: string[] }) {
    const existing = await this.prisma.role.findUnique({
      where: { name_companyId: { name: data.name, companyId: data.companyId || '' } },
    });
    if (existing) {
      throw GrpcErrors.ALREADY_EXISTS('Role with this name already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        companyId: data.companyId,
        permissions: data.permissionIds
          ? {
              create: data.permissionIds.map((permissionId) => ({ permissionId })),
            }
          : undefined,
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    return this.toRoleResponse(role);
  }

  async getRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });
    if (!role) {
      throw GrpcErrors.NOT_FOUND('Role not found');
    }
    return this.toRoleResponse(role);
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissionIds?: string[] }) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    if (data.permissionIds) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      await this.prisma.rolePermission.createMany({
        data: data.permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
      });
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: { include: { permission: true } },
      },
    });
    return this.toRoleResponse(role);
  }

  async deleteRole(id: string) {
    await this.prisma.role.delete({ where: { id } });
    return { success: true, message: 'Role deleted successfully' };
  }

  async listRoles(companyId: string) {
    const roles = await this.prisma.role.findMany({
      where: { OR: [{ companyId }, { isSystem: true }] },
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });
    return { roles: roles.map((r) => this.toRoleResponse(r)) };
  }

  async assignPermission(roleId: string, permissionId: string) {
    const existing = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    if (existing) {
      throw GrpcErrors.ALREADY_EXISTS('Role already has this permission');
    }
    await this.prisma.rolePermission.create({ data: { roleId, permissionId } });
    return this.getRole(roleId);
  }

  private toRoleResponse(role: any) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      companyId: role.companyId,
      isSystem: role.isSystem,
      permissions: (role.permissions || []).map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
      createdAt: role.createdAt?.toISOString() || '',
    };
  }
}
