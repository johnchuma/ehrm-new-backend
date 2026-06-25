import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { tenantStorage } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwt: JwtService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let companyId: string | null = null;
    let bypassRls = false;

    if (token) {
      try {
        const payload = this.jwt.decode(token) as any;
        if (payload) {
          companyId = payload.selectedCompanyId ?? null;
          // Super admin direct calls (not impersonating) bypass RLS
          bypassRls = payload.isSuperAdmin === true && payload.isImpersonating !== true;
        }
      } catch {
        // invalid token — let JwtAuthGuard handle the rejection
      }
    }

    tenantStorage.run({ companyId, bypassRls }, next);
  }
}
