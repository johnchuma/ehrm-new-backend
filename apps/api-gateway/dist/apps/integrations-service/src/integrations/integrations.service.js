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
exports.IntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let IntegrationService = class IntegrationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const i = await this.prisma.integration.create({ data });
        return this.toResponse(i);
    }
    async get(id) {
        const i = await this.prisma.integration.findUnique({ where: { id } });
        if (!i)
            throw decorators_1.GrpcErrors.NOT_FOUND('Integration not found');
        return this.toResponse(i);
    }
    async update(id, data) {
        const i = await this.prisma.integration.update({ where: { id }, data });
        return this.toResponse(i);
    }
    async delete(id) {
        await this.prisma.integration.delete({ where: { id } });
        return { success: true, message: 'Integration deleted' };
    }
    async list(companyId, type) {
        const where = { companyId };
        if (type)
            where.type = type;
        const items = await this.prisma.integration.findMany({ where });
        return { integrations: items.map((i) => this.toResponse(i)) };
    }
    async toggle(id, enabled) {
        const i = await this.prisma.integration.update({ where: { id }, data: { enabled } });
        return this.toResponse(i);
    }
    toResponse(i) {
        return {
            id: i.id, companyId: i.companyId, name: i.name, type: i.type,
            provider: i.provider, config: i.config, status: i.status,
            enabled: i.enabled, lastSyncAt: i.lastSyncAt?.toISOString() || '',
            createdAt: i.createdAt?.toISOString() || '',
        };
    }
};
exports.IntegrationService = IntegrationService;
exports.IntegrationService = IntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], IntegrationService);
//# sourceMappingURL=integrations.service.js.map