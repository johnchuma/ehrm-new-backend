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
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PerformanceController = class PerformanceController {
    client;
    revService;
    goalService;
    kpiService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.revService = this.client.getService('ReviewService');
        this.goalService = this.client.getService('GoalService');
        this.kpiService = this.client.getService('KpiService');
    }
    createRev(body) { return (0, rxjs_1.firstValueFrom)(this.revService.CreateReview(body)); }
    listRev(query) { return (0, rxjs_1.firstValueFrom)(this.revService.ListReviews(query)); }
    getRev(id) { return (0, rxjs_1.firstValueFrom)(this.revService.GetReview({ id })); }
    updateRev(id, body) { return (0, rxjs_1.firstValueFrom)(this.revService.UpdateReview({ id, ...body })); }
    submitRev(id) { return (0, rxjs_1.firstValueFrom)(this.revService.SubmitReview({ id })); }
    createGoal(body) { return (0, rxjs_1.firstValueFrom)(this.goalService.CreateGoal(body)); }
    listGoals(query) { return (0, rxjs_1.firstValueFrom)(this.goalService.ListGoals(query)); }
    getGoal(id) { return (0, rxjs_1.firstValueFrom)(this.goalService.GetGoal({ id })); }
    updateGoal(id, body) { return (0, rxjs_1.firstValueFrom)(this.goalService.UpdateGoal({ id, ...body })); }
    deleteGoal(id) { return (0, rxjs_1.firstValueFrom)(this.goalService.DeleteGoal({ id })); }
    createKpi(body) { return (0, rxjs_1.firstValueFrom)(this.kpiService.CreateKpi(body)); }
    listKpis(query) { return (0, rxjs_1.firstValueFrom)(this.kpiService.ListKpis(query)); }
    updateKpi(id, body) { return (0, rxjs_1.firstValueFrom)(this.kpiService.UpdateKpi({ id, ...body })); }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Post)('reviews'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'reviewerId', 'period', 'startDate', 'endDate', 'overallRating'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                reviewerId: { type: 'string', example: 'emp-005' },
                period: { type: 'string', example: 'Q1 2026' },
                startDate: { type: 'string', example: '2026-01-01' },
                endDate: { type: 'string', example: '2026-03-31' },
                overallRating: { type: 'number', example: 4.2 },
                comments: { type: 'string', example: 'Strong performance in project delivery' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createRev", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "listRev", null);
__decorate([
    (0, common_1.Get)('reviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getRev", null);
__decorate([
    (0, common_1.Put)('reviews/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                overallRating: { type: 'number', example: 4.5 },
                comments: { type: 'string', example: 'Excellent teamwork and leadership skills' },
                status: { type: 'string', example: 'approved' },
                strengths: { type: 'array', items: { type: 'string' }, example: ['Communication', 'Problem Solving'] },
                improvements: { type: 'array', items: { type: 'string' }, example: ['Time Management'] },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "updateRev", null);
__decorate([
    (0, common_1.Post)('reviews/:id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "submitRev", null);
__decorate([
    (0, common_1.Post)('goals'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'title', 'targetDate', 'metric', 'targetValue'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                title: { type: 'string', example: 'Increase customer satisfaction score' },
                description: { type: 'string', example: 'Improve NPS by 15% through better service delivery' },
                targetDate: { type: 'string', example: '2026-12-31' },
                metric: { type: 'string', example: 'NPS Score' },
                targetValue: { type: 'number', example: 85 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createGoal", null);
__decorate([
    (0, common_1.Get)('goals'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "listGoals", null);
__decorate([
    (0, common_1.Get)('goals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getGoal", null);
__decorate([
    (0, common_1.Put)('goals/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Increase customer satisfaction score' },
                description: { type: 'string', example: 'Improve NPS by 20% through enhanced support' },
                targetDate: { type: 'string', example: '2026-12-31' },
                metric: { type: 'string', example: 'NPS Score' },
                targetValue: { type: 'number', example: 90 },
                progress: { type: 'number', example: 65 },
                status: { type: 'string', example: 'in_progress' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "updateGoal", null);
__decorate([
    (0, common_1.Delete)('goals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "deleteGoal", null);
__decorate([
    (0, common_1.Post)('kpis'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'name', 'metric', 'targetValue', 'weight', 'period'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                name: { type: 'string', example: 'Revenue Generation' },
                description: { type: 'string', example: 'Monthly sales revenue target' },
                metric: { type: 'string', example: 'Revenue (TZS)' },
                targetValue: { type: 'number', example: 50000000 },
                weight: { type: 'number', example: 30 },
                period: { type: 'string', example: 'Q1 2026' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createKpi", null);
__decorate([
    (0, common_1.Get)('kpis'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "listKpis", null);
__decorate([
    (0, common_1.Put)('kpis/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Revenue Generation' },
                targetValue: { type: 'number', example: 55000000 },
                actualValue: { type: 'number', example: 48000000 },
                weight: { type: 'number', example: 30 },
                status: { type: 'string', example: 'in_progress' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "updateKpi", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, swagger_1.ApiTags)('Performance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('performance'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.PERFORMANCE)),
    __metadata("design:paramtypes", [Object])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map