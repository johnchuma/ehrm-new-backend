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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let LeaveController = class LeaveController {
    client;
    reqService;
    typeService;
    balService;
    encService;
    boService;
    liabService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.reqService = this.client.getService('LeaveRequestService');
        this.typeService = this.client.getService('LeaveTypeService');
        this.balService = this.client.getService('LeaveBalanceService');
        this.encService = this.client.getService('LeaveEncashmentService');
        this.boService = this.client.getService('BlackoutPeriodService');
        this.liabService = this.client.getService('LeaveLiabilityService');
    }
    create(body) { return (0, rxjs_1.firstValueFrom)(this.reqService.CreateRequest(body)); }
    list(query) { return (0, rxjs_1.firstValueFrom)(this.reqService.ListRequests(query)); }
    get(id) { return (0, rxjs_1.firstValueFrom)(this.reqService.GetRequest({ id })); }
    approve(id, body) { return (0, rxjs_1.firstValueFrom)(this.reqService.ApproveRequest({ id, ...body })); }
    reject(id, body) { return (0, rxjs_1.firstValueFrom)(this.reqService.RejectRequest({ id, ...body })); }
    calendar(companyId, query) { return (0, rxjs_1.firstValueFrom)(this.reqService.GetCalendarEvents({ companyId, ...query })); }
    createType(body) { return (0, rxjs_1.firstValueFrom)(this.typeService.CreateType(body)); }
    listTypes(query) { return (0, rxjs_1.firstValueFrom)(this.typeService.ListTypes(query)); }
    getType(id) { return (0, rxjs_1.firstValueFrom)(this.typeService.GetType({ id })); }
    updateType(id, body) { return (0, rxjs_1.firstValueFrom)(this.typeService.UpdateType({ id, ...body })); }
    deleteType(id) { return (0, rxjs_1.firstValueFrom)(this.typeService.DeleteType({ id })); }
    listBalances(employeeId) { return (0, rxjs_1.firstValueFrom)(this.balService.ListBalances({ employeeId })); }
    accrue(body) { return (0, rxjs_1.firstValueFrom)(this.balService.AccrueLeave(body)); }
    createEnc(body) { return (0, rxjs_1.firstValueFrom)(this.encService.CreateEncashment(body)); }
    listEnc(query) { return (0, rxjs_1.firstValueFrom)(this.encService.ListEncashments(query)); }
    createBO(body) { return (0, rxjs_1.firstValueFrom)(this.boService.CreateBlackout(body)); }
    listBO(query) { return (0, rxjs_1.firstValueFrom)(this.boService.ListBlackouts(query)); }
    getLiability(companyId) { return (0, rxjs_1.firstValueFrom)(this.liabService.GetLiability({ companyId })); }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Post)('requests'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'leaveTypeId', 'startDate', 'endDate', 'reason'],
            properties: {
                employeeId: { type: 'string', example: 'emp-204' },
                companyId: { type: 'string', example: 'comp-501' },
                leaveTypeId: { type: 'string', example: 'lt-annual-01' },
                startDate: { type: 'string', example: '2025-07-14' },
                endDate: { type: 'string', example: '2025-07-25' },
                reason: { type: 'string', example: 'Family vacation to Zanzibar' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('requests/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "get", null);
__decorate([
    (0, common_1.Post)('requests/:id/approve'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['approvedBy'],
            properties: {
                approvedBy: { type: 'string', example: 'emp-mng-001' },
                notes: { type: 'string', example: 'Approved. Ensure handover is completed before leave starts.' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('requests/:id/reject'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['rejectedBy', 'reason'],
            properties: {
                rejectedBy: { type: 'string', example: 'emp-mng-001' },
                reason: { type: 'string', example: 'Requested dates overlap with critical project deadline' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)('calendar/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "calendar", null);
__decorate([
    (0, common_1.Post)('types'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'code', 'defaultDays', 'isCarryForward', 'maxCarryForwardDays'],
            properties: {
                companyId: { type: 'string', example: 'comp-501' },
                name: { type: 'string', example: 'Annual Leave' },
                code: { type: 'string', example: 'AL' },
                defaultDays: { type: 'integer', example: 21 },
                isCarryForward: { type: 'boolean', example: true },
                maxCarryForwardDays: { type: 'integer', example: 5 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "createType", null);
__decorate([
    (0, common_1.Get)('types'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "listTypes", null);
__decorate([
    (0, common_1.Get)('types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getType", null);
__decorate([
    (0, common_1.Put)('types/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Sick Leave' },
                defaultDays: { type: 'integer', example: 14 },
                isCarryForward: { type: 'boolean', example: false },
                maxCarryForwardDays: { type: 'integer', example: 0 },
                isActive: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "updateType", null);
__decorate([
    (0, common_1.Delete)('types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "deleteType", null);
__decorate([
    (0, common_1.Get)('balances/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "listBalances", null);
__decorate([
    (0, common_1.Post)('balances/accrue'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'employeeId', 'leaveTypeId', 'period', 'days'],
            properties: {
                companyId: { type: 'string', example: 'comp-501' },
                employeeId: { type: 'string', example: 'emp-204' },
                leaveTypeId: { type: 'string', example: 'lt-annual-01' },
                period: { type: 'string', example: '2025-06' },
                days: { type: 'number', example: 1.75 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "accrue", null);
__decorate([
    (0, common_1.Post)('encashments'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'leaveTypeId', 'days', 'rate'],
            properties: {
                employeeId: { type: 'string', example: 'emp-523' },
                companyId: { type: 'string', example: 'comp-501' },
                leaveTypeId: { type: 'string', example: 'lt-annual-01' },
                days: { type: 'number', example: 3 },
                rate: { type: 'number', example: 45000 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "createEnc", null);
__decorate([
    (0, common_1.Get)('encashments'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "listEnc", null);
__decorate([
    (0, common_1.Post)('blackouts'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'startDate', 'endDate', 'description'],
            properties: {
                companyId: { type: 'string', example: 'comp-501' },
                name: { type: 'string', example: 'Year-End Close Period' },
                startDate: { type: 'string', example: '2025-12-20' },
                endDate: { type: 'string', example: '2025-12-31' },
                description: { type: 'string', example: 'No leave allowed during year-end financial closing' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "createBO", null);
__decorate([
    (0, common_1.Get)('blackouts'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "listBO", null);
__decorate([
    (0, common_1.Get)('liability/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getLiability", null);
exports.LeaveController = LeaveController = __decorate([
    (0, swagger_1.ApiTags)('Leave'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('leave'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.LEAVE)),
    __metadata("design:paramtypes", [Object])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map