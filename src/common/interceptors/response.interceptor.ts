import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          requestId: req.headers['x-request-id'] ?? null,
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
