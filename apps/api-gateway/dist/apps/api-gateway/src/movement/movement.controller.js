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
exports.MovementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MovementController = class MovementController {
    client;
    trService;
    prService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.trService = this.client.getService('TransferService');
        this.prService = this.client.getService('PromotionService');
    }
    createTr(body) { return (0, rxjs_1.firstValueFrom)(this.trService.CreateTransfer(body)); }
    listTr(query) { return (0, rxjs_1.firstValueFrom)(this.trService.ListTransfers(query)); }
    approveTr(id, body) { return (0, rxjs_1.firstValueFrom)(this.trService.ApproveTransfer({ id, ...body })); }
    createPr(body) { return (0, rxjs_1.firstValueFrom)(this.prService.CreatePromotion(body)); }
    listPr(query) { return (0, rxjs_1.firstValueFrom)(this.prService.ListPromotions(query)); }
    approvePr(id, body) { return (0, rxjs_1.firstValueFrom)(this.prService.ApprovePromotion({ id, ...body })); }
};
exports.MovementController = MovementController;
__decorate([
    (0, common_1.Post)('transfers'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'fromDepartment', 'toDepartment', 'effectiveDate', 'reason'],
            properties: {
                employeeId: { type: 'string', example: 'emp_001' },
                companyId: { type: 'string', example: 'comp_tz_001' },
                fromDepartment: { type: 'string', example: 'Finance' },
                toDepartment: { type: 'string', example: 'Operations' },
                fromPosition: { type: 'string', example: 'Accounts Clerk' },
                toPosition: { type: 'string', example: 'Operations Officer' },
                effectiveDate: { type: 'string', example: '2026-07-01' },
                reason: { type: 'string', example: 'Transfer to fill critical vacancy in Operations department, Dar es Salaam office' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MovementController.prototype, "createTr", null);
__decorate([
    (0, common_1.Get)('transfers'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MovementController.prototype, "listTr", null);
__decorate([
    (0, common_1.Post)('transfers/:id/approve'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['approvedBy'],
            properties: {
                approvedBy: { type: 'string', example: 'emp_020' },
                notes: { type: 'string', example: 'Transfer approved by Department Head pending employee acceptance' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MovementController.prototype, "approveTr", null);
__decorate([
    (0, common_1.Post)('promotions'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'fromPosition', 'toPosition', 'newSalary', 'effectiveDate', 'reason'],
            properties: {
                employeeId: { type: 'string', example: 'emp_003' },
                companyId: { type: 'string', example: 'comp_tz_001' },
                fromPosition: { type: 'string', example: 'Software Developer' },
                toPosition: { type: 'string', example: 'Senior Software Developer' },
                newSalary: { type: 'number', example: 3500000 },
                effectiveDate: { type: 'string', example: '2026-07-01' },
                reason: { type: 'string', example: 'Promotion in recognition of outstanding performance during Q1 2026 review period' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MovementController.prototype, "createPr", null);
__decorate([
    (0, common_1.Get)('promotions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MovementController.prototype, "listPr", null);
__decorate([
    (0, common_1.Post)('promotions/:id/approve'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['approvedBy'],
            properties: {
                approvedBy: { type: 'string', example: 'emp_025' },
                notes: { type: 'string', example: 'Promotion approved by Managing Director effective from next payroll cycle' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MovementController.prototype, "approvePr", null);
exports.MovementController = MovementController = __decorate([
    (0, swagger_1.ApiTags)('Movement'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('movement'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.MOVEMENT)),
    __metadata("design:paramtypes", [Object])
], MovementController);
//# sourceMappingURL=movement.controller.js.map