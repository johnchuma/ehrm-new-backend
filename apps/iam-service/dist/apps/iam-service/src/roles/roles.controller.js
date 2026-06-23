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
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const roles_service_1 = require("./roles.service");
let RoleController = class RoleController {
    roleService;
    constructor(roleService) {
        this.roleService = roleService;
    }
    async createRole(data) {
        return this.roleService.createRole(data);
    }
    async getRole(data) {
        return this.roleService.getRole(data.id);
    }
    async updateRole(data) {
        return this.roleService.updateRole(data.id, data);
    }
    async deleteRole(data) {
        return this.roleService.deleteRole(data.id);
    }
    async listRoles(data) {
        return this.roleService.listRoles(data.companyId);
    }
    async assignPermission(data) {
        return this.roleService.assignPermission(data.roleId, data.permissionId);
    }
};
exports.RoleController = RoleController;
__decorate([
    (0, microservices_1.GrpcMethod)('RoleService', 'CreateRole'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "createRole", null);
__decorate([
    (0, microservices_1.GrpcMethod)('RoleService', 'GetRole'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getRole", null);
__decorate([
    (0, microservices_1.GrpcMethod)('RoleService', 'UpdateRole'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "updateRole", null);
__decorate([
    (0, microservices_1.GrpcMethod)('RoleService', 'DeleteRole'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "deleteRole", null);
__decorate([
    (0, microservices_1.GrpcMethod)('RoleService', 'ListRoles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "listRoles", null);
__decorate([
    (0, microservices_1.GrpcMethod)('RoleService', 'AssignPermission'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "assignPermission", null);
exports.RoleController = RoleController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [roles_service_1.RoleService])
], RoleController);
//# sourceMappingURL=roles.controller.js.map