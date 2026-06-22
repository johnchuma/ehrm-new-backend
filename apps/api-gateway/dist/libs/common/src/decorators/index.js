"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcErrors = exports.throwGrpcError = exports.GrpcException = exports.CurrentRpcUser = exports.CurrentUser = exports.Public = exports.PUBLIC_KEY = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const grpc_js_1 = require("@grpc/grpc-js");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
exports.PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.PUBLIC_KEY, true);
exports.Public = Public;
exports.CurrentUser = (0, common_1.createParamDecorator)((data, context) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (data) {
        return user?.[data];
    }
    return user;
});
exports.CurrentRpcUser = (0, common_1.createParamDecorator)((data, context) => {
    const rpcContext = context.switchToRpc();
    const data_rpc = rpcContext.getData();
    if (data_rpc && data_rpc.user) {
        if (data)
            return data_rpc.user[data];
        return data_rpc.user;
    }
    return data_rpc;
});
class GrpcException extends microservices_1.RpcException {
    constructor(code, message) {
        super({ code, message });
    }
}
exports.GrpcException = GrpcException;
const throwGrpcError = (code, message) => {
    throw new microservices_1.RpcException({ code, message });
};
exports.throwGrpcError = throwGrpcError;
exports.GrpcErrors = {
    UNAUTHENTICATED: (msg = 'Unauthenticated') => (0, exports.throwGrpcError)(grpc_js_1.status.UNAUTHENTICATED, msg),
    PERMISSION_DENIED: (msg = 'Permission denied') => (0, exports.throwGrpcError)(grpc_js_1.status.PERMISSION_DENIED, msg),
    NOT_FOUND: (msg = 'Not found') => (0, exports.throwGrpcError)(grpc_js_1.status.NOT_FOUND, msg),
    ALREADY_EXISTS: (msg = 'Already exists') => (0, exports.throwGrpcError)(grpc_js_1.status.ALREADY_EXISTS, msg),
    INVALID_ARGUMENT: (msg = 'Invalid argument') => (0, exports.throwGrpcError)(grpc_js_1.status.INVALID_ARGUMENT, msg),
    INTERNAL: (msg = 'Internal error') => (0, exports.throwGrpcError)(grpc_js_1.status.INTERNAL, msg),
    UNAVAILABLE: (msg = 'Service unavailable') => (0, exports.throwGrpcError)(grpc_js_1.status.UNAVAILABLE, msg),
    FAILED_PRECONDITION: (msg = 'Failed precondition') => (0, exports.throwGrpcError)(grpc_js_1.status.FAILED_PRECONDITION, msg),
    OUT_OF_RANGE: (msg = 'Out of range') => (0, exports.throwGrpcError)(grpc_js_1.status.OUT_OF_RANGE, msg),
    UNIMPLEMENTED: (msg = 'Unimplemented') => (0, exports.throwGrpcError)(grpc_js_1.status.UNIMPLEMENTED, msg),
    DEADLINE_EXCEEDED: (msg = 'Deadline exceeded') => (0, exports.throwGrpcError)(grpc_js_1.status.DEADLINE_EXCEEDED, msg),
    RESOURCE_EXHAUSTED: (msg = 'Resource exhausted') => (0, exports.throwGrpcError)(grpc_js_1.status.RESOURCE_EXHAUSTED, msg),
    ABORTED: (msg = 'Aborted') => (0, exports.throwGrpcError)(grpc_js_1.status.ABORTED, msg),
    CANCELLED: (msg = 'Cancelled') => (0, exports.throwGrpcError)(grpc_js_1.status.CANCELLED, msg),
    DATA_LOSS: (msg = 'Data loss') => (0, exports.throwGrpcError)(grpc_js_1.status.DATA_LOSS, msg),
    UNKNOWN: (msg = 'Unknown error') => (0, exports.throwGrpcError)(grpc_js_1.status.UNKNOWN, msg),
};
//# sourceMappingURL=index.js.map