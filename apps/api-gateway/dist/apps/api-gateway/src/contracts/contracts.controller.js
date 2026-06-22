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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ContractsController = class ContractsController {
    client;
    service;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() { this.service = this.client.getService('ContractService'); }
    create(body) { return (0, rxjs_1.firstValueFrom)(this.service.CreateContract(body)); }
    list(query) { return (0, rxjs_1.firstValueFrom)(this.service.ListContracts(query)); }
    get(id) { return (0, rxjs_1.firstValueFrom)(this.service.GetContract({ id })); }
    update(id, body) { return (0, rxjs_1.firstValueFrom)(this.service.UpdateContract({ id, ...body })); }
    terminate(id, body) { return (0, rxjs_1.firstValueFrom)(this.service.TerminateContract({ id, ...body })); }
    renew(id, body) { return (0, rxjs_1.firstValueFrom)(this.service.RenewContract({ id, ...body })); }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'type', 'startDate', 'salary'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                type: { type: 'string', example: 'full-time' },
                startDate: { type: 'string', example: '2026-01-01' },
                endDate: { type: 'string', example: '2026-12-31' },
                salary: { type: 'number', example: 1500000 },
                terms: { type: 'string', example: 'Standard employment terms per Tanzania Labour Relations Act' },
                departmentId: { type: 'string', example: 'dept-001' },
                position: { type: 'string', example: 'Software Engineer' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                type: { type: 'string', example: 'full-time' },
                startDate: { type: 'string', example: '2026-01-01' },
                endDate: { type: 'string', example: '2026-12-31' },
                salary: { type: 'number', example: 1800000 },
                terms: { type: 'string', example: 'Updated salary and benefits per collective bargaining agreement' },
                status: { type: 'string', example: 'active' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/terminate'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['reason', 'terminationDate', 'approvedBy'],
            properties: {
                reason: { type: 'string', example: 'Mutual agreement between employer and employee' },
                terminationDate: { type: 'string', example: '2026-03-31' },
                noticePeriodDays: { type: 'number', example: 30 },
                severancePay: { type: 'number', example: 3000000 },
                approvedBy: { type: 'string', example: 'hr-director-001' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "terminate", null);
__decorate([
    (0, common_1.Post)(':id/renew'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['newEndDate', 'renewedBy'],
            properties: {
                newEndDate: { type: 'string', example: '2027-12-31' },
                salary: { type: 'number', example: 2000000 },
                terms: { type: 'string', example: 'Renewed with updated salary per annual review' },
                renewedBy: { type: 'string', example: 'hr-director-001' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "renew", null);
exports.ContractsController = ContractsController = __decorate([
    (0, swagger_1.ApiTags)('Contracts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('contracts'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.CONTRACTS)),
    __metadata("design:paramtypes", [Object])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map