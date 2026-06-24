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
exports.TicketService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let TicketService = class TicketService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(companyId, userId, status) {
        const where = { companyId };
        if (userId)
            where.userId = userId;
        if (status)
            where.status = status;
        const items = await this.prisma.hRTicket.findMany({
            where,
            include: { replies: true },
            orderBy: { createdAt: 'desc' },
        });
        return { tickets: items.map((t) => this.toResponse(t)) };
    }
    async create(data) {
        const t = await this.prisma.hRTicket.create({ data });
        return this.toResponse(t);
    }
    async reply(id, reply, userId) {
        await this.prisma.ticketReply.create({ data: { ticketId: id, userId, message: reply } });
        const t = await this.prisma.hRTicket.findUnique({ where: { id }, include: { replies: true } });
        return this.toResponse(t);
    }
    toResponse(t) {
        return {
            id: t.id, companyId: t.companyId, userId: t.userId, userName: t.userName,
            subject: t.subject, description: t.description, category: t.category,
            priority: t.priority, status: t.status,
            replies: (t.replies || []).map((r) => ({
                id: r.id, userId: r.userId, userName: r.userName,
                message: r.message, createdAt: r.createdAt?.toISOString() || '',
            })),
            createdAt: t.createdAt?.toISOString() || '',
            closedAt: t.closedAt?.toISOString() || '',
        };
    }
};
exports.TicketService = TicketService;
exports.TicketService = TicketService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], TicketService);
//# sourceMappingURL=tickets.service.js.map