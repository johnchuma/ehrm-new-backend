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
exports.KpiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let KpiService = class KpiService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const k = await this.prisma.kpi.create({ data });
        return this.toResponse(k);
    }
    async get(id) {
        const k = await this.prisma.kpi.findUnique({ where: { id } });
        if (!k)
            throw decorators_1.GrpcErrors.NOT_FOUND('KPI not found');
        return this.toResponse(k);
    }
    async update(id, data) {
        const k = await this.prisma.kpi.update({ where: { id }, data });
        return this.toResponse(k);
    }
    async list(companyId, category) {
        const where = { companyId };
        if (category)
            where.category = category;
        const kpis = await this.prisma.kpi.findMany({ where });
        return { kpis: kpis.map((k) => this.toResponse(k)) };
    }
    toResponse(k) {
        return {
            id: k.id, companyId: k.companyId, name: k.name, description: k.description,
            unit: k.unit, target: k.target, actual: k.actual,
            achievement: k.target > 0 ? Math.round((k.actual / k.target) * 100) : 0,
            category: k.category, createdAt: k.createdAt?.toISOString() || '',
        };
    }
};
exports.KpiService = KpiService;
exports.KpiService = KpiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], KpiService);
//# sourceMappingURL=kpis.service.js.map