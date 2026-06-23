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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const users_service_1 = require("./users.service");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async createUser(data) {
        return this.userService.createUser(data);
    }
    async getUser(data) {
        return this.userService.getUser(data.id);
    }
    async updateUser(data) {
        return this.userService.updateUser(data.id, data);
    }
    async deleteUser(data) {
        return this.userService.deleteUser(data.id);
    }
    async listUsers(data) {
        return this.userService.listUsers(data.companyId, data.page || 1, data.pageSize || 20, data.search);
    }
    async assignRole(data) {
        return this.userService.assignRole(data.userId, data.roleId);
    }
    async removeRole(data) {
        return this.userService.removeRole(data.userId, data.roleId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, microservices_1.GrpcMethod)('UserService', 'CreateUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, microservices_1.GrpcMethod)('UserService', 'GetUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, microservices_1.GrpcMethod)('UserService', 'UpdateUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, microservices_1.GrpcMethod)('UserService', 'DeleteUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, microservices_1.GrpcMethod)('UserService', 'ListUsers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "listUsers", null);
__decorate([
    (0, microservices_1.GrpcMethod)('UserService', 'AssignRole'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "assignRole", null);
__decorate([
    (0, microservices_1.GrpcMethod)('UserService', 'RemoveRole'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "removeRole", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UserService])
], UserController);
//# sourceMappingURL=users.controller.js.map