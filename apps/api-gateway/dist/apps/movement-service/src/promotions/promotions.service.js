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
exports.PromotionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let PromotionService = class PromotionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const p = await this.prisma.promotion.create({
            data: { ...data, effectiveDate: new Date(data.effectiveDate) },
        });
        return this.toResponse(p);
    }
    async approve(id, status) {
        const p = await this.prisma.promotion.update({ where: { id }, data: { status } });
        return this.toResponse(p);
    }
    async list(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        const items = await this.prisma.promotion.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { promotions: items.map((p) => this.toResponse(p)) };
    }
    toResponse(p) {
        return {
            id: p.id, companyId: p.companyId, employeeId: p.employeeId,
            employeeName: p.employeeName, fromTitle: p.fromTitle, toTitle: p.toTitle,
            fromGrade: p.fromGrade, toGrade: p.toGrade, newSalary: p.newSalary,
            effectiveDate: p.effectiveDate?.toISOString() || '',
            reason: p.reason, status: p.status, createdAt: p.createdAt?.toISOString() || '',
        };
    }
};
exports.PromotionService = PromotionService;
exports.PromotionService = PromotionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], PromotionService);
//# sourceMappingURL=promotions.service.js.map