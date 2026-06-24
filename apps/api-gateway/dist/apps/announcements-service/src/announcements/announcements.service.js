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
exports.AnnouncementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let AnnouncementService = class AnnouncementService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const a = await this.prisma.announcement.create({
            data: {
                ...data,
                publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
        });
        return this.toResponse(a);
    }
    async get(id) {
        const a = await this.prisma.announcement.findUnique({ where: { id } });
        if (!a)
            throw decorators_1.GrpcErrors.NOT_FOUND('Announcement not found');
        return this.toResponse(a);
    }
    async update(id, data) {
        if (data.publishedAt)
            data.publishedAt = new Date(data.publishedAt);
        if (data.expiresAt)
            data.expiresAt = new Date(data.expiresAt);
        const a = await this.prisma.announcement.update({ where: { id }, data });
        return this.toResponse(a);
    }
    async delete(id) {
        await this.prisma.announcement.delete({ where: { id } });
        return { success: true, message: 'Announcement deleted' };
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.type)
            where.type = filters.type;
        if (filters.priority)
            where.priority = filters.priority;
        const items = await this.prisma.announcement.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { announcements: items.map((a) => this.toResponse(a)) };
    }
    toResponse(a) {
        return {
            id: a.id, companyId: a.companyId, title: a.title, content: a.content,
            type: a.type, priority: a.priority, audience: a.audience,
            publishedAt: a.publishedAt?.toISOString() || '',
            expiresAt: a.expiresAt?.toISOString() || '',
            authorId: a.authorId, createdAt: a.createdAt?.toISOString() || '',
        };
    }
};
exports.AnnouncementService = AnnouncementService;
exports.AnnouncementService = AnnouncementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], AnnouncementService);
//# sourceMappingURL=announcements.service.js.map