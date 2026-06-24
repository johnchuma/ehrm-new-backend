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
exports.BonusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let BonusService = class BonusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const b = await this.prisma.bonus.create({ data });
        return this.toResponse(b);
    }
    async list(companyId, type) {
        const where = { companyId };
        if (type)
            where.type = type;
        const items = await this.prisma.bonus.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { bonuses: items.map((b) => this.toResponse(b)) };
    }
    toResponse(b) {
        return {
            id: b.id, companyId: b.companyId, employeeId: b.employeeId,
            employeeName: b.employeeName, type: b.type, amount: b.amount,
            period: b.period, status: b.status, notes: b.notes,
        };
    }
};
exports.BonusService = BonusService;
exports.BonusService = BonusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], BonusService);
//# sourceMappingURL=bonuses.service.js.map