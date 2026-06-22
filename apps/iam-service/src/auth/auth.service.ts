import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { AuthService } from '../../../../libs/common/src/auth/auth.service';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class IamAuthService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: any,
    private readonly authService: AuthService,
  ) {}

  async loginWithEmail(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw GrpcErrors.UNAUTHENTICATED('Invalid email or password');
    }

    if (!user.isActive) {
      throw GrpcErrors.PERMISSION_DENIED('Account is deactivated');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw GrpcErrors.PERMISSION_DENIED('Account is locked. Try again later.');
    }

    const isValid = await this.authService.comparePassword(password, user.password);
    if (!isValid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: { increment: 1 } },
      });
      throw GrpcErrors.UNAUTHENTICATED('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: 'LOGIN',
        resource: 'auth',
        details: 'User logged in via email',
      },
    });

    return this.generateAuthResponse(user);
  }

  async loginWithPhone(phone: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw GrpcErrors.UNAUTHENTICATED('Invalid phone or password');
    }

    if (!user.isActive) {
      throw GrpcErrors.PERMISSION_DENIED('Account is deactivated');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw GrpcErrors.PERMISSION_DENIED('Account is locked. Try again later.');
    }

    const isValid = await this.authService.comparePassword(password, user.password);
    if (!isValid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: { increment: 1 } },
      });
      throw GrpcErrors.UNAUTHENTICATED('Invalid phone or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: 'LOGIN',
        resource: 'auth',
        details: 'User logged in via phone',
      },
    });

    return this.generateAuthResponse(user);
  }

  async register(data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    companyId: string;
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
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: 'REGISTER',
        resource: 'auth',
        details: 'New user registered',
      },
    });

    return this.generateAuthResponse(user);
  }

  async validateToken(token: string) {
    try {
      const payload = this.authService.verifyToken(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        return { valid: false, user: null };
      }

      return { valid: true, user: this.toUserResponse(user) };
    } catch {
      return { valid: false, user: null };
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.authService.verifyToken(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw GrpcErrors.UNAUTHENTICATED('Invalid refresh token');
      }

      return this.generateAuthResponse(user);
    } catch (e) {
      throw GrpcErrors.UNAUTHENTICATED('Invalid or expired refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      const token = this.authService.generateRandomToken(48);
      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
    }

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!reset || reset.used || reset.expiresAt < new Date()) {
      throw GrpcErrors.INVALID_ARGUMENT('Invalid or expired reset token');
    }

    const hashedPassword = await this.authService.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashedPassword },
    });
    await this.prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw GrpcErrors.NOT_FOUND('User not found');
    }

    const isValid = await this.authService.comparePassword(oldPassword, user.password);
    if (!isValid) {
      throw GrpcErrors.UNAUTHENTICATED('Current password is incorrect');
    }

    const hashedPassword = await this.authService.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        resource: 'auth',
      },
    });
    return { message: 'Logged out successfully' };
  }

  private async generateAuthResponse(user: any) {
    const roleNames = user.roles.map((ur: any) => ur.role.name);
    const tokens = this.authService.generateTokens({
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      roles: roleNames,
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toUserResponse(user),
    };
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
