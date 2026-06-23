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
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const companies_service_1 = require("./companies.service");
let CompanyController = class CompanyController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(data) { return this.service.createCompany(data); }
    get(data) { return this.service.getCompany(data.id); }
    update(data) { return this.service.updateCompany(data.id, data); }
    remove(data) { return this.service.deleteCompany(data.id); }
    list(data) {
        return this.service.listCompanies(data.page || 1, data.pageSize || 20, data.search, data.status);
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, microservices_1.GrpcMethod)('CompanyService', 'CreateCompany'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "create", null);
__decorate([
    (0, microservices_1.GrpcMethod)('CompanyService', 'GetCompany'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "get", null);
__decorate([
    (0, microservices_1.GrpcMethod)('CompanyService', 'UpdateCompany'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "update", null);
__decorate([
    (0, microservices_1.GrpcMethod)('CompanyService', 'DeleteCompany'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "remove", null);
__decorate([
    (0, microservices_1.GrpcMethod)('CompanyService', 'ListCompanies'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "list", null);
exports.CompanyController = CompanyController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [companies_service_1.CompanyService])
], CompanyController);
//# sourceMappingURL=companies.controller.js.map