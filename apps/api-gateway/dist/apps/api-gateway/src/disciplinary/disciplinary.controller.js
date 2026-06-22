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
exports.DisciplinaryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let DisciplinaryController = class DisciplinaryController {
    client;
    caseService;
    actService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.caseService = this.client.getService('DisciplinaryService');
        this.actService = this.client.getService('DisciplinaryActionService');
    }
    createCase(body) { return (0, rxjs_1.firstValueFrom)(this.caseService.CreateCase(body)); }
    listCases(query) { return (0, rxjs_1.firstValueFrom)(this.caseService.ListCases(query)); }
    getCase(id) { return (0, rxjs_1.firstValueFrom)(this.caseService.GetCase({ id })); }
    updateCase(id, body) { return (0, rxjs_1.firstValueFrom)(this.caseService.UpdateCase({ id, ...body })); }
    createAction(body) { return (0, rxjs_1.firstValueFrom)(this.actService.CreateAction(body)); }
    approveAction(id, body) { return (0, rxjs_1.firstValueFrom)(this.actService.ApproveAction({ id, ...body })); }
    listActions(caseId) { return (0, rxjs_1.firstValueFrom)(this.actService.ListActions({ caseId })); }
};
exports.DisciplinaryController = DisciplinaryController;
__decorate([
    (0, common_1.Post)('cases'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'category', 'description', 'reportedBy', 'incidentDate'],
            properties: {
                employeeId: { type: 'string', example: 'emp_001' },
                companyId: { type: 'string', example: 'comp_tz_001' },
                category: { type: 'string', example: 'Misconduct' },
                description: { type: 'string', example: 'Employee reported late for duty without valid justification on three consecutive days' },
                reportedBy: { type: 'string', example: 'emp_010' },
                incidentDate: { type: 'string', example: '2026-06-15' },
                witnesses: { type: 'array', items: { type: 'string' }, example: ['emp_020', 'emp_025'] },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplinaryController.prototype, "createCase", null);
__decorate([
    (0, common_1.Get)('cases'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplinaryController.prototype, "listCases", null);
__decorate([
    (0, common_1.Get)('cases/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisciplinaryController.prototype, "getCase", null);
__decorate([
    (0, common_1.Put)('cases/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['status'],
            properties: {
                status: { type: 'string', example: 'Under Review' },
                description: { type: 'string', example: 'Updated description: additional witness statements have been collected' },
                outcome: { type: 'string', example: 'Written Warning' },
                notes: { type: 'string', example: 'Case escalated to HR manager for final determination' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DisciplinaryController.prototype, "updateCase", null);
__decorate([
    (0, common_1.Post)('actions'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['caseId', 'type', 'description', 'issuedBy', 'effectiveDate'],
            properties: {
                caseId: { type: 'string', example: 'case_001' },
                type: { type: 'string', example: 'Written Warning' },
                description: { type: 'string', example: 'Formal written warning for repeated tardiness as per company attendance policy' },
                issuedBy: { type: 'string', example: 'emp_010' },
                effectiveDate: { type: 'string', example: '2026-06-20' },
                duration: { type: 'string', example: '6 months' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplinaryController.prototype, "createAction", null);
__decorate([
    (0, common_1.Post)('actions/:id/approve'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['approvedBy'],
            properties: {
                approvedBy: { type: 'string', example: 'emp_015' },
                notes: { type: 'string', example: 'Action reviewed and approved by HR Director' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DisciplinaryController.prototype, "approveAction", null);
__decorate([
    (0, common_1.Get)('actions/:caseId'),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisciplinaryController.prototype, "listActions", null);
exports.DisciplinaryController = DisciplinaryController = __decorate([
    (0, swagger_1.ApiTags)('Disciplinary'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('disciplinary'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.DISCIPLINARY)),
    __metadata("design:paramtypes", [Object])
], DisciplinaryController);
//# sourceMappingURL=disciplinary.controller.js.map