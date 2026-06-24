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
exports.AssetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let AssetService = class AssetService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const a = await this.prisma.asset.create({
            data: { ...data, purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null },
        });
        return this.toResponse(a);
    }
    async get(id) {
        const a = await this.prisma.asset.findUnique({ where: { id } });
        if (!a)
            throw decorators_1.GrpcErrors.NOT_FOUND('Asset not found');
        return this.toResponse(a);
    }
    async update(id, data) {
        const a = await this.prisma.asset.update({ where: { id }, data });
        return this.toResponse(a);
    }
    async delete(id) {
        await this.prisma.asset.delete({ where: { id } });
        return { success: true, message: 'Asset deleted' };
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.category)
            where.category = filters.category;
        if (filters.status)
            where.status = filters.status;
        const items = await this.prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { assets: items.map((a) => this.toResponse(a)) };
    }
    toResponse(a) {
        return {
            id: a.id, companyId: a.companyId, name: a.name, category: a.category,
            serialNumber: a.serialNumber, model: a.model,
            purchaseDate: a.purchaseDate?.toISOString() || '',
            purchasePrice: a.purchasePrice, status: a.status, condition: a.condition,
            location: a.location, assignedTo: a.assignedTo,
            createdAt: a.createdAt?.toISOString() || '',
        };
    }
};
exports.AssetService = AssetService;
exports.AssetService = AssetService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], AssetService);
//# sourceMappingURL=assets.service.js.map