import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

const SENSITIVE_FIELDS = new Set([
  'password', 'codeHash', 'mfaSecret', 'credentials',
  'bankAccountNumber', 'nationalId', 'tin', 'nssfNumber',
]);

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const RESOURCE_MAP: Record<string, string> = {
  'companies': 'Company',
  'users': 'User',
  'employees': 'Employee',
  'branches': 'Branch',
  'departments': 'Department',
  'roles': 'Role',
  'audit-logs': 'AuditLog',
  'impersonate': 'ImpersonationAudit',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();

    if (!MUTATION_METHODS.has(req.method)) return next.handle();

    const user = req.user;
    if (!user) return next.handle();

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const segments = req.url.replace('/api/v1/', '').split('/').filter(Boolean);
          const resourceKey = segments.find((s) => RESOURCE_MAP[s]);
          const resource = resourceKey ? RESOURCE_MAP[resourceKey] : segments[0] ?? 'Unknown';
          const action = `${resource.toLowerCase()}.${this.verbFromMethod(req.method)}`;
          const resourceId = req.params?.id ?? req.params?.companyId ?? responseData?.id ?? null;

          await this.prisma.auditLog.create({
            data: {
              companyId: user.selectedCompanyId ?? null,
              actorId: user.sub,
              actorType: 'USER',
              originalActorId: user.originalAdminId ?? null,
              action,
              resource,
              resourceId,
              after: this.mask(responseData),
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'] ?? null,
              requestId: req.headers['x-request-id'] ?? null,
            },
          });
        } catch {
          // Audit failure must never break the actual request
        }
      }),
    );
  }

  private verbFromMethod(method: string): string {
    const map: Record<string, string> = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };
    return map[method] ?? 'mutate';
  }

  private mask(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const clean: any = Array.isArray(data) ? [] : {};
    for (const key of Object.keys(data)) {
      if (SENSITIVE_FIELDS.has(key)) {
        clean[key] = '[REDACTED]';
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        clean[key] = this.mask(data[key]);
      } else {
        clean[key] = data[key];
      }
    }
    return clean;
  }
}
