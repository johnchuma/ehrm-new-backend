import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class GlobalAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const { user } = ctx.switchToHttp().getRequest();

    if (!user) throw new UnauthorizedException();

    if (user.isImpersonating) {
      throw new ForbiddenException(
        'Impersonated sessions cannot access super admin routes',
      );
    }

    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Super admin access required');
    }

    return true;
  }
}
