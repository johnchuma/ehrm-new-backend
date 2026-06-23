"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(data) {
        return this.authService.loginWithEmail(data.email, data.password);
    }
    async loginWithPhone(data) {
        return this.authService.loginWithPhone(data.phone, data.password);
    }
    async register(data) {
        return this.authService.register(data);
    }
    async validateToken(data) {
        return this.authService.validateToken(data.token);
    }
    async refreshToken(data) {
        return this.authService.refreshToken(data.refreshToken);
    }
    async forgotPassword(data) {
        return this.authService.forgotPassword(data.email);
    }
    async resetPassword(data) {
        return this.authService.resetPassword(data.token, data.newPassword);
    }
    async changePassword(data) {
        return this.authService.changePassword(data.userId, data.oldPassword, data.newPassword);
    }
    async logout(data) {
        return this.authService.logout(data.userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'Login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'LoginWithPhone'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginWithPhone", null);
__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'Register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'ValidateToken'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'RefreshToken'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'ForgotPassword'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'ResetPassword'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'ChangePassword'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'Logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_service_1.IamAuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map