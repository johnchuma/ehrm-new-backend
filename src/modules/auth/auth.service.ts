import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Invalid email or password');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked. Try again later.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const attempts = user.failedAttempts + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: attempts, lockedUntil },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const roles = user.roles.map((ur) => ({
      roleId: ur.role.id,
      roleName: ur.role.name,
      scope: ur.role.scope,
      companyId: ur.role.companyId,
    }));

    const permissions: string[] = Array.from(
      new Set(
        user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name)),
      ),
    );

    const isSuperAdmin = user.roles.some(
      (ur) => ur.role.scope === 'GLOBAL' && ur.role.name === 'HRM_SUPER_ADMIN',
    );

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email ?? '',
      roles,
      permissions,
      selectedCompanyId: user.companyId ?? undefined,
      isSuperAdmin,
      isImpersonating: false,
    });

    const { password: _pw, mfaSecret: _mfa, ...safeUser } = user as any;
    return { ...tokens, user: safeUser };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyId?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) throw new UnauthorizedException('Email already exists');

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashed,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        companyId: data.companyId ?? undefined,
        isActive: true,
      },
    });

    const tokens = this.generateTokens({
      sub: user.id,
      email: user.email ?? '',
      roles: [],
      permissions: [],
      isSuperAdmin: false,
      isImpersonating: false,
    });

    const { password: _pw, ...safeUser } = user as any;
    return { ...tokens, user: safeUser };
  }

  generateTokens(payload: {
    sub: string;
    email: string;
    roles?: any[];
    permissions?: string[];
    selectedCompanyId?: string;
    isSuperAdmin?: boolean;
    isImpersonating?: boolean;
    originalAdminId?: string;
  }) {
    const jti = randomUUID();
    const accessToken = this.jwt.sign(
      { ...payload, type: 'access', jti },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwt.sign(
      { sub: payload.sub, email: payload.email, type: 'refresh' },
      { expiresIn: '7d' },
    );
    return { accessToken, refreshToken };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwt.verify(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new Error('User not found');
      return { valid: true, user };
    } catch {
      return { valid: false, user: null };
    }
  }
}
