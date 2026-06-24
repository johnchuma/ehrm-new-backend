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
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let EnrollmentService = class EnrollmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async enroll(data) {
        const benefit = await this.prisma.benefit.findUnique({ where: { id: data.benefitId } });
        const enrollment = await this.prisma.benefitEnrollment.create({
            data: { ...data, benefitName: benefit?.name, effectiveDate: new Date(data.effectiveDate) },
        });
        return this.toResponse(enrollment);
    }
    async list(companyId, employeeId) {
        const where = {};
        if (employeeId)
            where.employeeId = employeeId;
        const items = await this.prisma.benefitEnrollment.findMany({ where, orderBy: { enrolledAt: 'desc' } });
        return { enrollments: items.map((e) => this.toResponse(e)) };
    }
    toResponse(e) {
        return {
            id: e.id, benefitId: e.benefitId, benefitName: e.benefitName,
            employeeId: e.employeeId, employeeName: e.employeeName,
            effectiveDate: e.effectiveDate?.toISOString() || '',
            status: e.status, enrolledAt: e.enrolledAt?.toISOString() || '',
        };
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], EnrollmentService);
//# sourceMappingURL=enrollments.service.js.map