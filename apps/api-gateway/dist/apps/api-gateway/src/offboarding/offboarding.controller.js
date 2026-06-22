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
exports.OffboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let OffboardingController = class OffboardingController {
    client;
    offService;
    clrService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.offService = this.client.getService('OffboardingService');
        this.clrService = this.client.getService('ClearanceService');
    }
    create(body) { return (0, rxjs_1.firstValueFrom)(this.offService.CreateOffboarding(body)); }
    list(query) { return (0, rxjs_1.firstValueFrom)(this.offService.ListOffboardings(query)); }
    get(id) { return (0, rxjs_1.firstValueFrom)(this.offService.GetOffboarding({ id })); }
    update(id, body) { return (0, rxjs_1.firstValueFrom)(this.offService.UpdateOffboarding({ id, ...body })); }
    advance(id, body) { return (0, rxjs_1.firstValueFrom)(this.offService.AdvanceClearance({ id, ...body })); }
    complete(id) { return (0, rxjs_1.firstValueFrom)(this.offService.CompleteOffboarding({ id })); }
    createClr(body) { return (0, rxjs_1.firstValueFrom)(this.clrService.CreateClearance(body)); }
    listClr(offboardingId) { return (0, rxjs_1.firstValueFrom)(this.clrService.ListClearances({ offboardingId })); }
    approveClr(id, body) { return (0, rxjs_1.firstValueFrom)(this.clrService.ApproveClearance({ id, ...body })); }
};
exports.OffboardingController = OffboardingController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'reason', 'lastWorkingDay'],
            properties: {
                employeeId: { type: 'string', example: 'emp-015' },
                companyId: { type: 'string', example: 'comp-001' },
                reason: { type: 'string', example: 'Resignation' },
                lastWorkingDay: { type: 'string', example: '2026-08-15' },
                handoverTo: { type: 'string', example: 'emp-020' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'in_progress' },
                lastWorkingDay: { type: 'string', example: '2026-08-15' },
                reason: { type: 'string', example: 'Resignation - relocated to Dar es Salaam' },
                notes: { type: 'string', example: 'Handover meeting scheduled for Aug 10' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/clearance'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['department', 'checklistItems'],
            properties: {
                department: { type: 'string', example: 'IT Department' },
                checklistItems: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Return laptop', 'Return access badge', 'Transfer project files'],
                },
                notes: { type: 'string', example: 'All IT equipment to be returned by Aug 12' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "advance", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)('clearance'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['offboardingId', 'department', 'checklistItems'],
            properties: {
                offboardingId: { type: 'string', example: 'off-001' },
                department: { type: 'string', example: 'Finance Department' },
                checklistItems: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Settle outstanding advances', 'Return company credit card', 'Clear petty cash'],
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "createClr", null);
__decorate([
    (0, common_1.Get)('clearance/:offboardingId'),
    __param(0, (0, common_1.Param)('offboardingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "listClr", null);
__decorate([
    (0, common_1.Post)('clearance/:id/approve'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['approvedBy'],
            properties: {
                approvedBy: { type: 'string', example: 'emp-005' },
                notes: { type: 'string', example: 'All items verified and returned in good condition' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "approveClr", null);
exports.OffboardingController = OffboardingController = __decorate([
    (0, swagger_1.ApiTags)('Offboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('offboarding'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.OFFBOARDING)),
    __metadata("design:paramtypes", [Object])
], OffboardingController);
//# sourceMappingURL=offboarding.controller.js.map