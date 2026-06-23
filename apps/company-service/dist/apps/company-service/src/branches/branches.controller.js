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
exports.BranchController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const branches_service_1 = require("./branches.service");
let BranchController = class BranchController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(data) { return this.service.createBranch(data); }
    get(data) { return this.service.getBranch(data.id); }
    update(data) { return this.service.updateBranch(data.id, data); }
    remove(data) { return this.service.deleteBranch(data.id); }
    list(data) { return this.service.listBranches(data.companyId); }
};
exports.BranchController = BranchController;
__decorate([
    (0, microservices_1.GrpcMethod)('BranchService', 'CreateBranch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "create", null);
__decorate([
    (0, microservices_1.GrpcMethod)('BranchService', 'GetBranch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "get", null);
__decorate([
    (0, microservices_1.GrpcMethod)('BranchService', 'UpdateBranch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "update", null);
__decorate([
    (0, microservices_1.GrpcMethod)('BranchService', 'DeleteBranch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "remove", null);
__decorate([
    (0, microservices_1.GrpcMethod)('BranchService', 'ListBranches'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BranchController.prototype, "list", null);
exports.BranchController = BranchController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [branches_service_1.BranchService])
], BranchController);
//# sourceMappingURL=branches.controller.js.map