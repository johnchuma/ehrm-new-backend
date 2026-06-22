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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PayrollController = class PayrollController {
    client;
    runService;
    advService;
    dedService;
    alwService;
    bonService;
    setService;
    jService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.runService = this.client.getService('PayrollRunService');
        this.advService = this.client.getService('SalaryAdvanceService');
        this.dedService = this.client.getService('DeductionService');
        this.alwService = this.client.getService('AllowanceService');
        this.bonService = this.client.getService('BonusService');
        this.setService = this.client.getService('SettlementService');
        this.jService = this.client.getService('PayrollJournalService');
    }
    generate(body) { return (0, rxjs_1.firstValueFrom)(this.runService.GeneratePayroll(body)); }
    list(query) { return (0, rxjs_1.firstValueFrom)(this.runService.ListRuns(query)); }
    getRun(id) { return (0, rxjs_1.firstValueFrom)(this.runService.GetRun({ id })); }
    getRunDetails(id) { return (0, rxjs_1.firstValueFrom)(this.runService.GetRunDetails({ id })); }
    approveRun(id, body) { return (0, rxjs_1.firstValueFrom)(this.runService.ApproveRun({ id, ...body })); }
    publish(id) { return (0, rxjs_1.firstValueFrom)(this.runService.PublishPayslips({ id })); }
    createAdv(body) { return (0, rxjs_1.firstValueFrom)(this.advService.CreateAdvance(body)); }
    listAdv(query) { return (0, rxjs_1.firstValueFrom)(this.advService.ListAdvances(query)); }
    createDed(body) { return (0, rxjs_1.firstValueFrom)(this.dedService.CreateDeduction(body)); }
    listDed(query) { return (0, rxjs_1.firstValueFrom)(this.dedService.ListDeductions(query)); }
    createAlw(body) { return (0, rxjs_1.firstValueFrom)(this.alwService.CreateAllowance(body)); }
    listAlw(query) { return (0, rxjs_1.firstValueFrom)(this.alwService.ListAllowances(query)); }
    createBon(body) { return (0, rxjs_1.firstValueFrom)(this.bonService.CreateBonus(body)); }
    listBon(query) { return (0, rxjs_1.firstValueFrom)(this.bonService.ListBonuses(query)); }
    createSet(body) { return (0, rxjs_1.firstValueFrom)(this.setService.CreateSettlement(body)); }
    listSet(query) { return (0, rxjs_1.firstValueFrom)(this.setService.ListSettlements(query)); }
    getJournal(query) { return (0, rxjs_1.firstValueFrom)(this.jService.GetJournal(query)); }
    exportJournal(body) { return (0, rxjs_1.firstValueFrom)(this.jService.ExportJournal(body)); }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)('runs'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'period', 'startDate', 'endDate', 'paymentDate'],
            properties: {
                companyId: { type: 'string', example: 'comp-501' },
                period: { type: 'string', example: '2025-06' },
                startDate: { type: 'string', example: '2025-06-01' },
                endDate: { type: 'string', example: '2025-06-30' },
                paymentDate: { type: 'string', example: '2025-06-28' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('runs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('runs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getRun", null);
__decorate([
    (0, common_1.Get)('runs/:id/details'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getRunDetails", null);
__decorate([
    (0, common_1.Post)('runs/:id/approve'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['approvedBy'],
            properties: {
                approvedBy: { type: 'string', example: 'emp-mng-001' },
                notes: { type: 'string', example: 'June 2025 payroll verified and approved' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "approveRun", null);
__decorate([
    (0, common_1.Post)('runs/:id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)('advances'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'amount', 'reason', 'repaymentMonths'],
            properties: {
                employeeId: { type: 'string', example: 'emp-204' },
                companyId: { type: 'string', example: 'comp-501' },
                amount: { type: 'number', example: 850000 },
                reason: { type: 'string', example: 'Medical emergency' },
                repaymentMonths: { type: 'integer', example: 6 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createAdv", null);
__decorate([
    (0, common_1.Get)('advances'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listAdv", null);
__decorate([
    (0, common_1.Post)('deductions'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'type', 'amount', 'description', 'isRecurring'],
            properties: {
                employeeId: { type: 'string', example: 'emp-307' },
                companyId: { type: 'string', example: 'comp-501' },
                type: { type: 'string', example: 'loan-repayment' },
                amount: { type: 'number', example: 150000 },
                description: { type: 'string', example: 'Salary advance loan deduction for June' },
                isRecurring: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createDed", null);
__decorate([
    (0, common_1.Get)('deductions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listDed", null);
__decorate([
    (0, common_1.Post)('allowances'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'type', 'amount', 'description', 'isRecurring'],
            properties: {
                employeeId: { type: 'string', example: 'emp-115' },
                companyId: { type: 'string', example: 'comp-501' },
                type: { type: 'string', example: 'transport' },
                amount: { type: 'number', example: 250000 },
                description: { type: 'string', example: 'Monthly transport allowance' },
                isRecurring: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createAlw", null);
__decorate([
    (0, common_1.Get)('allowances'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listAlw", null);
__decorate([
    (0, common_1.Post)('bonuses'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'type', 'amount', 'description', 'paymentDate'],
            properties: {
                employeeId: { type: 'string', example: 'emp-412' },
                companyId: { type: 'string', example: 'comp-501' },
                type: { type: 'string', example: 'performance' },
                amount: { type: 'number', example: 1200000 },
                description: { type: 'string', example: 'Q2 2025 performance bonus' },
                paymentDate: { type: 'string', example: '2025-06-28' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createBon", null);
__decorate([
    (0, common_1.Get)('bonuses'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listBon", null);
__decorate([
    (0, common_1.Post)('settlements'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'amount', 'type', 'reason', 'paymentDate'],
            properties: {
                employeeId: { type: 'string', example: 'emp-523' },
                companyId: { type: 'string', example: 'comp-501' },
                amount: { type: 'number', example: 3500000 },
                type: { type: 'string', example: 'end-of-service' },
                reason: { type: 'string', example: 'Contract termination settlement' },
                paymentDate: { type: 'string', example: '2025-06-30' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createSet", null);
__decorate([
    (0, common_1.Get)('settlements'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listSet", null);
__decorate([
    (0, common_1.Get)('journal'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getJournal", null);
__decorate([
    (0, common_1.Post)('journal/export'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'period', 'format', 'startDate', 'endDate'],
            properties: {
                companyId: { type: 'string', example: 'comp-501' },
                period: { type: 'string', example: '2025-06' },
                format: { type: 'string', example: 'pdf' },
                startDate: { type: 'string', example: '2025-06-01' },
                endDate: { type: 'string', example: '2025-06-30' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "exportJournal", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('payroll'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.PAYROLL)),
    __metadata("design:paramtypes", [Object])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map