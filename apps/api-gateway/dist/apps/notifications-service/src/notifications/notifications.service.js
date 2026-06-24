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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let NotificationService = class NotificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const n = await this.prisma.notification.create({ data });
        return this.toResponse(n);
    }
    async get(id) {
        const n = await this.prisma.notification.findUnique({ where: { id } });
        if (!n)
            throw decorators_1.GrpcErrors.NOT_FOUND('Notification not found');
        return this.toResponse(n);
    }
    async markAsRead(id) {
        const n = await this.prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() },
        });
        return this.toResponse(n);
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        return { success: true, message: 'All notifications marked as read' };
    }
    async delete(id) {
        await this.prisma.notification.delete({ where: { id } });
        return { success: true, message: 'Notification deleted' };
    }
    async list(userId, unreadOnly = false, page = 1, pageSize = 20) {
        const where = { userId };
        if (unreadOnly)
            where.isRead = false;
        const [items, total, unread] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return { notifications: items.map((n) => this.toResponse(n)), total, unread };
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
        return { count };
    }
    toResponse(n) {
        return {
            id: n.id, userId: n.userId, companyId: n.companyId, title: n.title,
            message: n.message, type: n.type, link: n.link, category: n.category,
            isRead: n.isRead, createdAt: n.createdAt?.toISOString() || '',
            readAt: n.readAt?.toISOString() || '',
        };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], NotificationService);
//# sourceMappingURL=notifications.service.js.map