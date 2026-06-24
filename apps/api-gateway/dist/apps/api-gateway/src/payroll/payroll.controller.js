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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const payroll_runs_service_1 = require("../../../payroll-service/src/payroll-runs/payroll-runs.service");
const salary_advance_service_1 = require("../../../payroll-service/src/salary-advance/salary-advance.service");
const deductions_service_1 = require("../../../payroll-service/src/deductions/deductions.service");
const allowances_service_1 = require("../../../payroll-service/src/allowances/allowances.service");
const bonuses_service_1 = require("../../../payroll-service/src/bonuses/bonuses.service");
const settlements_service_1 = require("../../../payroll-service/src/settlements/settlements.service");
const journal_service_1 = require("../../../payroll-service/src/journal/journal.service");
let PayrollController = class PayrollController {
    runService;
    advService;
    dedService;
    alwService;
    bonService;
    setService;
    jService;
    constructor(runService, advService, dedService, alwService, bonService, setService, jService) {
        this.runService = runService;
        this.advService = advService;
        this.dedService = dedService;
        this.alwService = alwService;
        this.bonService = bonService;
        this.setService = setService;
        this.jService = jService;
    }
    generate(body) { return this.runService.generate(body); }
    list(query) { return this.runService.list(query.companyId, query); }
    getRun(id) { return this.runService.get(id); }
    getRunDetails(id) { return this.runService.getDetails(id); }
    approveRun(id, body) { return this.runService.approve(id, body.approvedBy); }
    publish(id) { return this.runService.publishPayslips(id); }
    createAdv(body) { return this.advService.create(body); }
    listAdv(query) { return this.advService.list(query.companyId, query.status); }
    createDed(body) { return this.dedService.create(body); }
    listDed(query) { return this.dedService.list(query.companyId); }
    createAlw(body) { return this.alwService.create(body); }
    listAlw(query) { return this.alwService.list(query.companyId); }
    createBon(body) { return this.bonService.create(body); }
    listBon(query) { return this.bonService.list(query.companyId, query.type); }
    createSet(body) { return this.setService.create(body); }
    listSet(query) { return this.setService.list(query.companyId, query.status); }
    getJournal(query) { return this.jService.getJournal(query); }
    exportJournal(body) { return this.jService.exportJournal(body); }
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
    __metadata("design:paramtypes", [payroll_runs_service_1.PayrollRunService,
        salary_advance_service_1.AdvanceService,
        deductions_service_1.DeductionService,
        allowances_service_1.AllowanceService,
        bonuses_service_1.BonusService,
        settlements_service_1.SettlementService,
        journal_service_1.JournalService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map