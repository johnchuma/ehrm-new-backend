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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AnalyticsController = class AnalyticsController {
    client;
    service;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() { this.service = this.client.getService('AnalyticsService'); }
    dashboard(companyId) { return (0, rxjs_1.firstValueFrom)(this.service.GetDashboard({ companyId })); }
    headcount(companyId) { return (0, rxjs_1.firstValueFrom)(this.service.GetHeadcountAnalytics({ companyId })); }
    attendance(companyId) { return (0, rxjs_1.firstValueFrom)(this.service.GetAttendanceAnalytics({ companyId })); }
    leave(companyId) { return (0, rxjs_1.firstValueFrom)(this.service.GetLeaveAnalytics({ companyId })); }
    payroll(companyId) { return (0, rxjs_1.firstValueFrom)(this.service.GetPayrollAnalytics({ companyId })); }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('headcount/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "headcount", null);
__decorate([
    (0, common_1.Get)('attendance/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "attendance", null);
__decorate([
    (0, common_1.Get)('leave/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "leave", null);
__decorate([
    (0, common_1.Get)('payroll/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "payroll", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('analytics'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.ANALYTICS)),
    __metadata("design:paramtypes", [Object])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map