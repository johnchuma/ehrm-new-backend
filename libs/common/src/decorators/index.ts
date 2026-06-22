import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

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
    const rpcContext = context.switchToRpc();
    const data_rpc = rpcContext.getData();
    if (data_rpc && data_rpc.user) {
      if (data) return data_rpc.user[data];
      return data_rpc.user;
    }
    return data_rpc;
  },
);

export class GrpcException extends RpcException {
  constructor(code: number, message: string) {
    super({ code, message });
  }
}

export const throwGrpcError = (code: number, message: string) => {
  throw new RpcException({ code, message });
};

export const GrpcErrors = {
  UNAUTHENTICATED: (msg = 'Unauthenticated') => throwGrpcError(GrpcStatus.UNAUTHENTICATED, msg),
  PERMISSION_DENIED: (msg = 'Permission denied') => throwGrpcError(GrpcStatus.PERMISSION_DENIED, msg),
  NOT_FOUND: (msg = 'Not found') => throwGrpcError(GrpcStatus.NOT_FOUND, msg),
  ALREADY_EXISTS: (msg = 'Already exists') => throwGrpcError(GrpcStatus.ALREADY_EXISTS, msg),
  INVALID_ARGUMENT: (msg = 'Invalid argument') => throwGrpcError(GrpcStatus.INVALID_ARGUMENT, msg),
  INTERNAL: (msg = 'Internal error') => throwGrpcError(GrpcStatus.INTERNAL, msg),
  UNAVAILABLE: (msg = 'Service unavailable') => throwGrpcError(GrpcStatus.UNAVAILABLE, msg),
  FAILED_PRECONDITION: (msg = 'Failed precondition') => throwGrpcError(GrpcStatus.FAILED_PRECONDITION, msg),
  OUT_OF_RANGE: (msg = 'Out of range') => throwGrpcError(GrpcStatus.OUT_OF_RANGE, msg),
  UNIMPLEMENTED: (msg = 'Unimplemented') => throwGrpcError(GrpcStatus.UNIMPLEMENTED, msg),
  DEADLINE_EXCEEDED: (msg = 'Deadline exceeded') => throwGrpcError(GrpcStatus.DEADLINE_EXCEEDED, msg),
  RESOURCE_EXHAUSTED: (msg = 'Resource exhausted') => throwGrpcError(GrpcStatus.RESOURCE_EXHAUSTED, msg),
  ABORTED: (msg = 'Aborted') => throwGrpcError(GrpcStatus.ABORTED, msg),
  CANCELLED: (msg = 'Cancelled') => throwGrpcError(GrpcStatus.CANCELLED, msg),
  DATA_LOSS: (msg = 'Data loss') => throwGrpcError(GrpcStatus.DATA_LOSS, msg),
  UNKNOWN: (msg = 'Unknown error') => throwGrpcError(GrpcStatus.UNKNOWN, msg),
};
