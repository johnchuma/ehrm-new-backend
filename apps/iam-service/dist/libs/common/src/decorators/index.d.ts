import { RpcException } from '@nestjs/microservices';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const CurrentUser: (...dataOrPipes: (string | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
export declare const CurrentRpcUser: (...dataOrPipes: (string | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
export declare class GrpcException extends RpcException {
    constructor(code: number, message: string);
}
export declare const throwGrpcError: (code: number, message: string) => never;
export declare const GrpcErrors: {
    UNAUTHENTICATED: (msg?: string) => never;
    PERMISSION_DENIED: (msg?: string) => never;
    NOT_FOUND: (msg?: string) => never;
    ALREADY_EXISTS: (msg?: string) => never;
    INVALID_ARGUMENT: (msg?: string) => never;
    INTERNAL: (msg?: string) => never;
    UNAVAILABLE: (msg?: string) => never;
    FAILED_PRECONDITION: (msg?: string) => never;
    OUT_OF_RANGE: (msg?: string) => never;
    UNIMPLEMENTED: (msg?: string) => never;
    DEADLINE_EXCEEDED: (msg?: string) => never;
    RESOURCE_EXHAUSTED: (msg?: string) => never;
    ABORTED: (msg?: string) => never;
    CANCELLED: (msg?: string) => never;
    DATA_LOSS: (msg?: string) => never;
    UNKNOWN: (msg?: string) => never;
};
