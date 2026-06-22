import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): Observable<any> | void {
    const ctxType = host.getType();

    if (ctxType === 'rpc') {
      return this.handleRpc(exception);
    } else if (ctxType === 'http') {
      return this.handleHttp(exception, host);
    }
  }

  private handleHttp(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception.message || 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private handleRpc(exception: any): Observable<never> {
    let code = GrpcStatus.INTERNAL;
    let message = 'Internal server error';

    if (exception instanceof RpcException) {
      const error: any = exception.getError();
      if (typeof error === 'object' && error !== null) {
        code = error.code || GrpcStatus.INTERNAL;
        message = error.message || message;
      } else {
        message = String(error);
      }
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      code = this.mapHttpToGrpc(status);
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : (response as any).message || message;
    } else if (exception?.code !== undefined) {
      code = exception.code;
      message = exception.message || message;
    } else if (exception?.message) {
      message = exception.message;
    }

    return throwError(() => ({ code, message }));
  }

  private mapHttpToGrpc(httpStatus: number): number {
    const map: Record<number, number> = {
      400: GrpcStatus.INVALID_ARGUMENT,
      401: GrpcStatus.UNAUTHENTICATED,
      403: GrpcStatus.PERMISSION_DENIED,
      404: GrpcStatus.NOT_FOUND,
      409: GrpcStatus.ALREADY_EXISTS,
      429: GrpcStatus.RESOURCE_EXHAUSTED,
      500: GrpcStatus.INTERNAL,
      503: GrpcStatus.UNAVAILABLE,
    };
    return map[httpStatus] || GrpcStatus.INTERNAL;
  }
}
