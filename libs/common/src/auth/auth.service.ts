import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRES_IN } from './auth.module';

export interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  roles: string[];
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateTokens(payload: Omit<JwtPayload, 'type'>): TokenPair {
    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      { secret: JWT_SECRET, expiresIn: JWT_EXPIRES_IN },
    );
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { secret: JWT_SECRET, expiresIn: '30d' },
    );
    return { accessToken, refreshToken };
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token, { secret: JWT_SECRET });
  }

  generateRandomToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
