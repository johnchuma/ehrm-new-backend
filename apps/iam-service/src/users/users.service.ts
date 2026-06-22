import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { AuthService } from '../../../../libs/common/src/auth/auth.service';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class UserService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: any,
    private readonly authService: AuthService,
  ) {}

  async createUser(data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    companyId: string;
    employeeId?: string;
    roleIds?: string[];
    isActive?: boolean;
  }) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase() },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (existing) {
      throw GrpcErrors.ALREADY_EXISTS('User with this email or phone already exists');
    }

    const hashedPassword = await this.authService.hashPassword(data.password);
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        phone: data.phone,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        companyId: data.companyId,
        employeeId: data.employeeId,
        isActive: data.isActive !== undefined ? data.isActive : true,
        roles: data.roleIds
          ? {
              create: data.roleIds.map((roleId) => ({ roleId })),
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    return this.toUserResponse(user);
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw GrpcErrors.NOT_FOUND('User not found');
    }

    return this.toUserResponse(user);
  }

  async updateUser(id: string, data: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    roleIds?: string[];
  }) {
    const updateData: any = {};
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.firstName || data.lastName) {
      const existing = await this.prisma.user.findUnique({ where: { id } });
      if (existing) {
        updateData.fullName = `${data.firstName || existing.firstName} ${data.lastName || existing.lastName}`;
      }
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      await this.prisma.userRole.createMany({
        data: data.roleIds.map((roleId) => ({ userId: id, roleId })),
      });
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    return this.toUserResponse(user);
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'User deleted successfully' };
  }

  async listUsers(companyId: string, page: number = 1, pageSize: number = 20, search?: string) {
    const where: any = { companyId };
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { fullName: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => this.toUserResponse(u)),
      total,
      page,
      pageSize,
    };
  }

  async assignRole(userId: string, roleId: string) {
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (existing) {
      throw GrpcErrors.ALREADY_EXISTS('User already has this role');
    }
    await this.prisma.userRole.create({ data: { userId, roleId } });
    return this.getUser(userId);
  }

  async removeRole(userId: string, roleId: string) {
    await this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
    return this.getUser(userId);
  }

  private toUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      companyId: user.companyId,
      employeeId: user.employeeId,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      roles: (user.roles || []).map((ur: any) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
        companyId: ur.role.companyId,
        isSystem: ur.role.isSystem,
        permissions: (ur.role.permissions || []).map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          resource: rp.permission.resource,
          action: rp.permission.action,
          description: rp.permission.description,
        })),
        createdAt: ur.role.createdAt?.toISOString() || '',
      })),
      createdAt: user.createdAt?.toISOString() || '',
      updatedAt: user.updatedAt?.toISOString() || '',
      lastLoginAt: user.lastLoginAt?.toISOString() || '',
    };
  }
}
