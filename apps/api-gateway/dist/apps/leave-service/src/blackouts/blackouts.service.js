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
exports.BlackoutService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let BlackoutService = class BlackoutService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const bp = await this.prisma.blackoutPeriod.create({
            data: { ...data, from: new Date(data.from), to: new Date(data.to) },
        });
        return this.toResponse(bp);
    }
    async list(companyId) {
        const bps = await this.prisma.blackoutPeriod.findMany({ where: { companyId } });
        return { blackouts: bps.map((b) => this.toResponse(b)) };
    }
    toResponse(b) {
        return {
            id: b.id, companyId: b.companyId, name: b.name,
            from: b.from?.toISOString() || '', to: b.to?.toISOString() || '',
            scope: b.scope, status: b.status, description: b.description,
        };
    }
};
exports.BlackoutService = BlackoutService;
exports.BlackoutService = BlackoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], BlackoutService);
//# sourceMappingURL=blackouts.service.js.map