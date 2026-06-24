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
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let WebhookService = class WebhookService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const w = await this.prisma.webhook.create({ data: { ...data, events: data.events.join(',') } });
        return this.toResponse(w);
    }
    async list(companyId) {
        const items = await this.prisma.webhook.findMany({ where: { companyId } });
        return { webhooks: items.map((w) => this.toResponse(w)) };
    }
    async delete(id) {
        await this.prisma.webhook.delete({ where: { id } });
        return { success: true, message: 'Webhook deleted' };
    }
    toResponse(w) {
        return {
            id: w.id, companyId: w.companyId, url: w.url,
            events: w.events ? w.events.split(',') : [],
            secret: w.secret, status: w.status,
            createdAt: w.createdAt?.toISOString() || '',
        };
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], WebhookService);
//# sourceMappingURL=webhooks.service.js.map