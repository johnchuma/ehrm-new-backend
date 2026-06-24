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
exports.AdvanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let AdvanceService = class AdvanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const adv = await this.prisma.salaryAdvance.create({ data });
        return this.toResponse(adv);
    }
    async list(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        const advs = await this.prisma.salaryAdvance.findMany({ where, orderBy: { disbursedAt: 'desc' } });
        return { advances: advs.map((a) => this.toResponse(a)) };
    }
    toResponse(a) {
        return {
            id: a.id, companyId: a.companyId, employeeId: a.employeeId,
            employeeName: a.employeeName, amount: a.amount, termMonths: a.termMonths,
            status: a.status, disbursedAt: a.disbursedAt?.toISOString() || '', notes: a.notes,
        };
    }
};
exports.AdvanceService = AdvanceService;
exports.AdvanceService = AdvanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], AdvanceService);
//# sourceMappingURL=salary-advance.service.js.map