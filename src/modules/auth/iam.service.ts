import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class IamService {
  constructor(private readonly prisma: PrismaService) {}

  private async attachUserCounts<T extends { id: string; name: string; companyId?: string | null }>(roles: T[]) {
    if (!roles.length) return [];

    const companyIds = [...new Set(roles.map((role) => role.companyId).filter(Boolean))] as string[];
    const users = await this.prisma.user.findMany({
      where: companyIds.length ? { companyId: { in: companyIds } } : {},
      select: {
        id: true,
        companyId: true,
        role: true,
        roles: { select: { roleId: true } },
      },
    });

    return roles.map((role) => {
      const assignedUserIds = new Set<string>();
      for (const user of users) {
        if (role.companyId && user.companyId !== role.companyId) continue;
        if (user.role === role.name) assignedUserIds.add(user.id);
        if (user.roles.some((entry) => entry.roleId === role.id)) {
          assignedUserIds.add(user.id);
        }
      }
      return {
        ...role,
        users: assignedUserIds.size,
      };
    });
  }

  private async ensurePermission(name: string): Promise<string> {
    const parts = name.split('_');
    const resource = parts.slice(1).join('_') || 'unknown';
    const action = parts[0] || 'manage';
    let perm = await this.prisma.permission.findUnique({ where: { name } });
    if (!perm) {
      perm = await this.prisma.permission.create({ data: { name, resource, action } });
    }
    return perm.id;
  }

  private async syncPermissions(roleId: string, permissionNames: string[]) {
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    for (const name of permissionNames) {
      const pid = await this.ensurePermission(name);
      await this.prisma.rolePermission.create({ data: { roleId, permissionId: pid } }).catch(() => {});
    }
  }

  // ── Roles ──

  async listRoles(companyId?: string) {
    const roles = await this.prisma.role.findMany({
      where: companyId
        ? { OR: [{ isSystem: true }, { companyId }] }
        : { isSystem: true },
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });
    return this.attachUserCounts(roles);
  }

  async getRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    const [roleWithCount] = await this.attachUserCounts([role]);
    return roleWithCount;
  }

  async createRole(data: { name: string; description?: string; companyId?: string; permissionNames?: string[] }) {
    const existing = await this.prisma.role.findFirst({
      where: { name: data.name, companyId: data.companyId || null },
    });
    if (existing) throw new BadRequestException('Role already exists');
    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description || '',
        companyId: data.companyId || null,
        isSystem: !data.companyId,
      },
    });
    if (data.permissionNames?.length) {
      await this.syncPermissions(role.id, data.permissionNames);
    }
    return this.getRole(role.id);
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissionNames?: string[] }) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem && data.name) throw new BadRequestException('Cannot rename system role');
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (Object.keys(updateData).length) {
      await this.prisma.role.update({ where: { id }, data: updateData });
    }
    if (data.permissionNames) {
      await this.syncPermissions(id, data.permissionNames);
    }
    return this.getRole(id);
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new BadRequestException('Cannot delete system role');
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    await this.prisma.userRole.deleteMany({ where: { roleId: id } });
    return this.prisma.role.delete({ where: { id } });
  }

  // ── User-Role Assignment ──

  async assignRole(userId: string, roleId: string) {
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (existing) throw new BadRequestException('User already has this role');
    return this.prisma.userRole.create({ data: { userId, roleId } });
  }

  async removeRole(userId: string, roleId: string) {
    return this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
  }

  // ── Permissions (optional — can also be hardcoded frontend side) ──

  async listPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] });
  }
}
