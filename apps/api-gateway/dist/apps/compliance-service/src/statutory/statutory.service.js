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
exports.StatutoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let StatutoryService = class StatutoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const f = await this.prisma.statutoryFiling.create({
            data: { ...data, dueDate: new Date(data.dueDate) },
        });
        return this.toResponse(f);
    }
    async update(id, data) {
        if (data.filedDate)
            data.filedDate = new Date(data.filedDate);
        const f = await this.prisma.statutoryFiling.update({ where: { id }, data });
        return this.toResponse(f);
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.type)
            where.type = filters.type;
        if (filters.status)
            where.status = filters.status;
        const items = await this.prisma.statutoryFiling.findMany({ where, orderBy: { dueDate: 'asc' } });
        return { filings: items.map((f) => this.toResponse(f)) };
    }
    toResponse(f) {
        return {
            id: f.id, companyId: f.companyId, type: f.type, period: f.period,
            amount: f.amount, dueDate: f.dueDate?.toISOString() || '',
            authority: f.authority, status: f.status, reference: f.reference,
            filedDate: f.filedDate?.toISOString() || '',
            createdAt: f.createdAt?.toISOString() || '',
        };
    }
};
exports.StatutoryService = StatutoryService;
exports.StatutoryService = StatutoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], StatutoryService);
//# sourceMappingURL=statutory.service.js.map