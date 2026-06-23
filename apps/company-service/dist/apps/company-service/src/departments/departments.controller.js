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
exports.DepartmentController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const departments_service_1 = require("./departments.service");
let DepartmentController = class DepartmentController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(data) { return this.service.createDepartment(data); }
    get(data) { return this.service.getDepartment(data.id); }
    update(data) { return this.service.updateDepartment(data.id, data); }
    remove(data) { return this.service.deleteDepartment(data.id); }
    list(data) { return this.service.listDepartments(data.companyId, data.branchId); }
};
exports.DepartmentController = DepartmentController;
__decorate([
    (0, microservices_1.GrpcMethod)('DepartmentService', 'CreateDepartment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "create", null);
__decorate([
    (0, microservices_1.GrpcMethod)('DepartmentService', 'GetDepartment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "get", null);
__decorate([
    (0, microservices_1.GrpcMethod)('DepartmentService', 'UpdateDepartment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "update", null);
__decorate([
    (0, microservices_1.GrpcMethod)('DepartmentService', 'DeleteDepartment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "remove", null);
__decorate([
    (0, microservices_1.GrpcMethod)('DepartmentService', 'ListDepartments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepartmentController.prototype, "list", null);
exports.DepartmentController = DepartmentController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [departments_service_1.DepartmentService])
], DepartmentController);
//# sourceMappingURL=departments.controller.js.map