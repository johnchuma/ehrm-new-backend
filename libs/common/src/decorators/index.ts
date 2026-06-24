import { SetMetadata, createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(PUBLIC_KEY, true);

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (data) {
      return user?.[data];
    }
    return user;
  },
);

export const CurrentRpcUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (data) {
      return user?.[data];
    }
    return user;
  },
);

export const HttpErrors = {
  UNAUTHENTICATED: (msg = 'Unauthenticated') => {
    throw new HttpException(msg, HttpStatus.UNAUTHORIZED);
  },
  PERMISSION_DENIED: (msg = 'Permission denied') => {
    throw new HttpException(msg, HttpStatus.FORBIDDEN);
  },
  NOT_FOUND: (msg = 'Not found') => {
    throw new HttpException(msg, HttpStatus.NOT_FOUND);
  },
  ALREADY_EXISTS: (msg = 'Already exists') => {
    throw new HttpException(msg, HttpStatus.CONFLICT);
  },
  INVALID_ARGUMENT: (msg = 'Invalid argument') => {
    throw new HttpException(msg, HttpStatus.BAD_REQUEST);
  },
  INTERNAL: (msg = 'Internal error') => {
    throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
  },
  UNAVAILABLE: (msg = 'Service unavailable') => {
    throw new HttpException(msg, HttpStatus.SERVICE_UNAVAILABLE);
  },
  FAILED_PRECONDITION: (msg = 'Failed precondition') => {
    throw new HttpException(msg, HttpStatus.PRECONDITION_FAILED);
  },
  BAD_REQUEST: (msg = 'Bad request') => {
    throw new HttpException(msg, HttpStatus.BAD_REQUEST);
  },
  CONFLICT: (msg = 'Conflict') => {
    throw new HttpException(msg, HttpStatus.CONFLICT);
  },
};

// Backward compatibility alias - services still import GrpcErrors
export const GrpcErrors = HttpErrors;

// Backward compatibility - some files import GrpcException
export class GrpcException extends HttpException {
  constructor(code: number, message: string) {
    const statusMap: Record<number, number> = {
      1: HttpStatus.INTERNAL_SERVER_ERROR,
      2: HttpStatus.INTERNAL_SERVER_ERROR,
      3: HttpStatus.BAD_REQUEST,
      5: HttpStatus.NOT_FOUND,
      6: HttpStatus.CONFLICT,
      7: HttpStatus.FORBIDDEN,
      10: HttpStatus.CONFLICT,
      13: HttpStatus.INTERNAL_SERVER_ERROR,
      14: HttpStatus.SERVICE_UNAVAILABLE,
      16: HttpStatus.UNAUTHORIZED,
    };
    super(message, statusMap[code] || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export const throwGrpcError = (code: number, message: string) => {
  throw new GrpcException(code, message);
};
