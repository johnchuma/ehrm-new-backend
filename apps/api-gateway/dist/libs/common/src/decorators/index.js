"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwGrpcError = exports.GrpcException = exports.GrpcErrors = exports.HttpErrors = exports.CurrentRpcUser = exports.CurrentUser = exports.Public = exports.PUBLIC_KEY = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
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
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (data) {
        return user?.[data];
    }
    return user;
});
exports.HttpErrors = {
    UNAUTHENTICATED: (msg = 'Unauthenticated') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.UNAUTHORIZED);
    },
    PERMISSION_DENIED: (msg = 'Permission denied') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.FORBIDDEN);
    },
    NOT_FOUND: (msg = 'Not found') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.NOT_FOUND);
    },
    ALREADY_EXISTS: (msg = 'Already exists') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.CONFLICT);
    },
    INVALID_ARGUMENT: (msg = 'Invalid argument') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.BAD_REQUEST);
    },
    INTERNAL: (msg = 'Internal error') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    },
    UNAVAILABLE: (msg = 'Service unavailable') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    },
    FAILED_PRECONDITION: (msg = 'Failed precondition') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.PRECONDITION_FAILED);
    },
    BAD_REQUEST: (msg = 'Bad request') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.BAD_REQUEST);
    },
    CONFLICT: (msg = 'Conflict') => {
        throw new common_1.HttpException(msg, common_1.HttpStatus.CONFLICT);
    },
};
exports.GrpcErrors = exports.HttpErrors;
class GrpcException extends common_1.HttpException {
    constructor(code, message) {
        const statusMap = {
            1: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            2: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            3: common_1.HttpStatus.BAD_REQUEST,
            5: common_1.HttpStatus.NOT_FOUND,
            6: common_1.HttpStatus.CONFLICT,
            7: common_1.HttpStatus.FORBIDDEN,
            10: common_1.HttpStatus.CONFLICT,
            13: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            14: common_1.HttpStatus.SERVICE_UNAVAILABLE,
            16: common_1.HttpStatus.UNAUTHORIZED,
        };
        super(message, statusMap[code] || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.GrpcException = GrpcException;
const throwGrpcError = (code, message) => {
    throw new GrpcException(code, message);
};
exports.throwGrpcError = throwGrpcError;
//# sourceMappingURL=index.js.map