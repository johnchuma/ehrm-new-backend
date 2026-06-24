import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid email or password');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    const tokens = this.generateTokens({ sub: user.id, email: user.email });
    return { ...tokens, user };
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; companyId?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new UnauthorizedException('Email already exists');
    const hashed = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashed,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        companyId: data.companyId || '',
        isActive: true,
      },
    });
    const tokens = this.generateTokens({ sub: user.id, email: user.email });
    return { ...tokens, user };
  }

  private generateTokens(payload: { sub: string; email: string }) {
    const accessToken = this.jwt.sign({ ...payload, type: 'access' }, { expiresIn: '7d' });
    const refreshToken = this.jwt.sign({ ...payload, type: 'refresh' }, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }
}
