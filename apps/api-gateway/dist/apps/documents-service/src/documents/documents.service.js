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
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let DocumentService = class DocumentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upload(data) {
        const d = await this.prisma.document.create({
            data: { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
        });
        return this.toResponse(d);
    }
    async get(id) {
        const d = await this.prisma.document.findUnique({ where: { id } });
        if (!d)
            throw decorators_1.GrpcErrors.NOT_FOUND('Document not found');
        return this.toResponse(d);
    }
    async update(id, data) {
        const d = await this.prisma.document.update({ where: { id }, data });
        return this.toResponse(d);
    }
    async delete(id) {
        await this.prisma.document.delete({ where: { id } });
        return { success: true, message: 'Document deleted' };
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.employeeId)
            where.employeeId = filters.employeeId;
        if (filters.category)
            where.category = filters.category;
        if (filters.type)
            where.type = filters.type;
        const items = await this.prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { documents: items.map((d) => this.toResponse(d)) };
    }
    async share(id, userIds, expiresAt) {
        const d = await this.prisma.document.update({
            where: { id },
            data: { sharedWith: userIds.join(','), expiresAt: expiresAt ? new Date(expiresAt) : null },
        });
        return this.toResponse(d);
    }
    toResponse(d) {
        return {
            id: d.id, companyId: d.companyId, employeeId: d.employeeId,
            name: d.name, type: d.type, category: d.category, url: d.url,
            size: d.size, uploadedBy: d.uploadedBy, description: d.description,
            sharedWith: d.sharedWith ? d.sharedWith.split(',') : [],
            expiresAt: d.expiresAt?.toISOString() || '',
            createdAt: d.createdAt?.toISOString() || '',
            updatedAt: d.updatedAt?.toISOString() || '',
        };
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], DocumentService);
//# sourceMappingURL=documents.service.js.map