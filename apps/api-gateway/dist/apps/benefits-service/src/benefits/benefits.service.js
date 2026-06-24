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
exports.BenefitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let BenefitService = class BenefitService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const b = await this.prisma.benefit.create({ data });
        return this.toResponse(b);
    }
    async get(id) {
        const b = await this.prisma.benefit.findUnique({ where: { id } });
        if (!b)
            throw decorators_1.GrpcErrors.NOT_FOUND('Benefit not found');
        return this.toResponse(b);
    }
    async update(id, data) {
        const b = await this.prisma.benefit.update({ where: { id }, data });
        return this.toResponse(b);
    }
    async delete(id) {
        await this.prisma.benefit.delete({ where: { id } });
        return { success: true, message: 'Benefit deleted' };
    }
    async list(companyId, type) {
        const where = { companyId };
        if (type)
            where.type = type;
        const items = await this.prisma.benefit.findMany({ where });
        return { benefits: items.map((b) => this.toResponse(b)) };
    }
    toResponse(b) {
        return {
            id: b.id, companyId: b.companyId, name: b.name, type: b.type,
            description: b.description, employeeContribution: b.employeeContribution,
            employerContribution: b.employerContribution, eligibility: b.eligibility,
            status: b.status, createdAt: b.createdAt?.toISOString() || '',
        };
    }
};
exports.BenefitService = BenefitService;
exports.BenefitService = BenefitService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], BenefitService);
//# sourceMappingURL=benefits.service.js.map