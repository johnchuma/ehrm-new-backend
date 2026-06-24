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
exports.BenefitsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const benefits_service_1 = require("../../../benefits-service/src/benefits/benefits.service");
const enrollments_service_1 = require("../../../benefits-service/src/enrollments/enrollments.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BenefitsController = class BenefitsController {
    benService;
    enrService;
    constructor(benService, enrService) {
        this.benService = benService;
        this.enrService = enrService;
    }
    create(body) { return this.benService.create(body); }
    list(query) { return this.benService.list(query.companyId, query.type); }
    get(id) { return this.benService.get(id); }
    update(id, body) { return this.benService.update(id, body); }
    remove(id) { return this.benService.delete(id); }
    enroll(body) { return this.enrService.enroll(body); }
    listEnr(query) { return this.enrService.list(query.companyId, query.employeeId); }
};
exports.BenefitsController = BenefitsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'type', 'provider', 'premiumAmount', 'coverageAmount'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                name: { type: 'string', example: 'NHIF Medical Cover' },
                description: { type: 'string', example: 'Comprehensive medical insurance for employees and dependants' },
                type: { type: 'string', example: 'medical' },
                provider: { type: 'string', example: 'NHIF Tanzania' },
                premiumAmount: { type: 'number', example: 50000 },
                coverageAmount: { type: 'number', example: 10000000 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BenefitsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BenefitsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BenefitsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'NHIF Medical Cover Plus' },
                description: { type: 'string', example: 'Enhanced medical insurance with dental and optical coverage' },
                premiumAmount: { type: 'number', example: 75000 },
                coverageAmount: { type: 'number', example: 15000000 },
                isActive: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BenefitsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BenefitsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('enroll'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'benefitId', 'companyId', 'startDate'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                benefitId: { type: 'string', example: 'ben-001' },
                companyId: { type: 'string', example: 'comp-001' },
                startDate: { type: 'string', example: '2026-01-01' },
                nominees: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', example: 'Jane Mwangi' },
                            relationship: { type: 'string', example: 'spouse' },
                            percentage: { type: 'number', example: 60 },
                        },
                    },
                    example: [{ name: 'Jane Mwangi', relationship: 'spouse', percentage: 60 }, { name: 'John Mwangi Jr', relationship: 'child', percentage: 40 }],
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BenefitsController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)('enrollments'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BenefitsController.prototype, "listEnr", null);
exports.BenefitsController = BenefitsController = __decorate([
    (0, swagger_1.ApiTags)('Benefits'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('benefits'),
    __metadata("design:paramtypes", [benefits_service_1.BenefitService,
        enrollments_service_1.EnrollmentService])
], BenefitsController);
//# sourceMappingURL=benefits.controller.js.map