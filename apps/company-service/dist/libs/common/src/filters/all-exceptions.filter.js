"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const grpc_js_1 = require("@grpc/grpc-js");
const rxjs_1 = require("rxjs");
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctxType = host.getType();
        if (ctxType === 'rpc') {
            return this.handleRpc(exception);
        }
        else if (ctxType === 'http') {
            return this.handleHttp(exception, host);
        }
    }
    handleHttp(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : exception.message || 'Internal server error';
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
    handleRpc(exception) {
        let code = grpc_js_1.status.INTERNAL;
        let message = 'Internal server error';
        if (exception instanceof microservices_1.RpcException) {
            const error = exception.getError();
            if (typeof error === 'object' && error !== null) {
                code = error.code || grpc_js_1.status.INTERNAL;
                message = error.message || message;
            }
            else {
                message = String(error);
            }
        }
        else if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            code = this.mapHttpToGrpc(status);
            const response = exception.getResponse();
            message = typeof response === 'string' ? response : response.message || message;
        }
        else if (exception?.code !== undefined) {
            code = exception.code;
            message = exception.message || message;
        }
        else if (exception?.message) {
            message = exception.message;
        }
        return (0, rxjs_1.throwError)(() => ({ code, message }));
    }
    mapHttpToGrpc(httpStatus) {
        const map = {
            400: grpc_js_1.status.INVALID_ARGUMENT,
            401: grpc_js_1.status.UNAUTHENTICATED,
            403: grpc_js_1.status.PERMISSION_DENIED,
            404: grpc_js_1.status.NOT_FOUND,
            409: grpc_js_1.status.ALREADY_EXISTS,
            429: grpc_js_1.status.RESOURCE_EXHAUSTED,
            500: grpc_js_1.status.INTERNAL,
            503: grpc_js_1.status.UNAVAILABLE,
        };
        return map[httpStatus] || grpc_js_1.status.INTERNAL;
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map