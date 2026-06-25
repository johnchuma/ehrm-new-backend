import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers?.authorization as string | undefined;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    try {
      req.user = this.jwt.verify(authHeader.slice(7));
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }
}
