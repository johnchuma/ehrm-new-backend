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
exports.SalaryIntelligenceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const salary_intelligence_service_1 = require("../../../salary-intelligence-service/src/salary-intelligence/salary-intelligence.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SalaryIntelligenceController = class SalaryIntelligenceController {
    salaryIntelligenceService;
    constructor(salaryIntelligenceService) {
        this.salaryIntelligenceService = salaryIntelligenceService;
    }
    benchmarks(query) { return this.salaryIntelligenceService.getBenchmarks(query.companyId, query.jobTitle, query.department); }
    compensation(query) { return this.salaryIntelligenceService.getCompensationAnalysis(query.companyId, query.departmentId); }
    structure(companyId) { return this.salaryIntelligenceService.getSalaryStructure(companyId); }
    simulate(body) { return this.salaryIntelligenceService.simulateSalary(body.companyId, body.employeeId, body.newSalary); }
};
exports.SalaryIntelligenceController = SalaryIntelligenceController;
__decorate([
    (0, common_1.Get)('benchmarks'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalaryIntelligenceController.prototype, "benchmarks", null);
__decorate([
    (0, common_1.Get)('compensation'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalaryIntelligenceController.prototype, "compensation", null);
__decorate([
    (0, common_1.Get)('structure/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalaryIntelligenceController.prototype, "structure", null);
__decorate([
    (0, common_1.Post)('simulate'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'employeeId', 'newPosition', 'newDepartment', 'newSalary', 'effectiveDate'],
            properties: {
                companyId: { type: 'string', example: 'comp-tz-001' },
                employeeId: { type: 'string', example: 'emp-001' },
                newPosition: { type: 'string', example: 'Senior Software Engineer' },
                newDepartment: { type: 'string', example: 'Engineering' },
                newSalary: { type: 'number', example: 4500000 },
                effectiveDate: { type: 'string', example: '2026-07-01' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalaryIntelligenceController.prototype, "simulate", null);
exports.SalaryIntelligenceController = SalaryIntelligenceController = __decorate([
    (0, swagger_1.ApiTags)('Salary Intelligence'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('salary-intelligence'),
    __metadata("design:paramtypes", [salary_intelligence_service_1.SalaryIntelligenceService])
], SalaryIntelligenceController);
//# sourceMappingURL=salary-intelligence.controller.js.map