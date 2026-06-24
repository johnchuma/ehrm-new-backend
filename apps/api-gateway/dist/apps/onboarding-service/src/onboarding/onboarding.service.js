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
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let OnboardingService = class OnboardingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const o = await this.prisma.onboarding.create({
            data: { ...data, startDate: new Date(data.startDate) },
        });
        return this.toResponse(o);
    }
    async get(id) {
        const o = await this.prisma.onboarding.findUnique({ where: { id } });
        if (!o)
            throw decorators_1.GrpcErrors.NOT_FOUND('Onboarding not found');
        return this.toResponse(o);
    }
    async update(id, data) {
        const o = await this.prisma.onboarding.update({ where: { id }, data });
        return this.toResponse(o);
    }
    async advanceStage(id, stage) {
        const o = await this.prisma.onboarding.update({ where: { id }, data: { currentStage: stage } });
        return this.toResponse(o);
    }
    async complete(id) {
        const o = await this.prisma.onboarding.update({
            where: { id },
            data: { status: 'Completed', completedAt: new Date() },
        });
        return this.toResponse(o);
    }
    async list(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        const items = await this.prisma.onboarding.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { onboardings: items.map((o) => this.toResponse(o)) };
    }
    toResponse(o) {
        return {
            id: o.id, companyId: o.companyId, employeeId: o.employeeId,
            employeeName: o.employeeName, startDate: o.startDate?.toISOString() || '',
            buddy: o.buddy, departmentId: o.departmentId, position: o.position,
            currentStage: o.currentStage, status: o.status,
            createdAt: o.createdAt?.toISOString() || '',
            completedAt: o.completedAt?.toISOString() || '',
        };
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map