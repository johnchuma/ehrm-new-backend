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
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ComplianceController = class ComplianceController {
    client;
    compService;
    statService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.compService = this.client.getService('ComplianceService');
        this.statService = this.client.getService('StatutoryService');
    }
    createReq(body) { return (0, rxjs_1.firstValueFrom)(this.compService.CreateRequirement(body)); }
    listReq(query) { return (0, rxjs_1.firstValueFrom)(this.compService.ListRequirements(query)); }
    updateReq(id, body) { return (0, rxjs_1.firstValueFrom)(this.compService.UpdateRequirement({ id, ...body })); }
    createFiling(body) { return (0, rxjs_1.firstValueFrom)(this.statService.CreateFiling(body)); }
    listFilings(query) { return (0, rxjs_1.firstValueFrom)(this.statService.ListFilings(query)); }
    updateFiling(id, body) { return (0, rxjs_1.firstValueFrom)(this.statService.UpdateFiling({ id, ...body })); }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Post)('requirements'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'title', 'type', 'authority', 'dueDate'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                title: { type: 'string', example: 'Annual WCF Contributions Filing' },
                description: { type: 'string', example: 'Mandatory annual filing of Workers Compensation Fund contributions' },
                type: { type: 'string', example: 'statutory' },
                authority: { type: 'string', example: 'Workers Compensation Fund (WCF)' },
                dueDate: { type: 'string', example: '2026-03-31' },
                penalty: { type: 'string', example: 'TZS 500,000 late filing penalty per month' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "createReq", null);
__decorate([
    (0, common_1.Get)('requirements'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "listReq", null);
__decorate([
    (0, common_1.Put)('requirements/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Annual WCF Contributions Filing - Updated' },
                description: { type: 'string', example: 'Updated filing with revised contribution amounts' },
                dueDate: { type: 'string', example: '2026-04-30' },
                status: { type: 'string', example: 'in-progress' },
                evidence: { type: 'string', example: 'Receipt #WCF-2026-001' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "updateReq", null);
__decorate([
    (0, common_1.Post)('filings'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'requirementId', 'period', 'dueDate', 'description'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                requirementId: { type: 'string', example: 'req-001' },
                period: { type: 'string', example: '2026-Q1' },
                dueDate: { type: 'string', example: '2026-04-30' },
                description: { type: 'string', example: 'PAYE monthly return for March 2026' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "createFiling", null);
__decorate([
    (0, common_1.Get)('filings'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "listFilings", null);
__decorate([
    (0, common_1.Put)('filings/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'approved' },
                submittedDate: { type: 'string', example: '2026-03-28' },
                approvalDate: { type: 'string', example: '2026-04-05' },
                referenceNumber: { type: 'string', example: 'TRA-PAYE-2026-03-001' },
                notes: { type: 'string', example: 'Filing approved by TRA with no issues' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "updateFiling", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, swagger_1.ApiTags)('Compliance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('compliance'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.COMPLIANCE)),
    __metadata("design:paramtypes", [Object])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map