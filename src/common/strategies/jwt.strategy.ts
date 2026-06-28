import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'ehrm-super-secret-key-2026',
    });
  }

  async validate(payload: any) {
    if (!payload?.sub) throw new UnauthorizedException();

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Account inactive');

    return {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
      companyId: payload.selectedCompanyId ?? null,
      selectedCompanyId: payload.selectedCompanyId ?? null,
      isSuperAdmin: payload.isSuperAdmin ?? false,
      isImpersonating: payload.isImpersonating ?? false,
      originalAdminId: payload.originalAdminId ?? null,
      jti: payload.jti,
    };
  }
}
