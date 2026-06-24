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
exports.OvertimeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let OvertimeService = class OvertimeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const ot = await this.prisma.overtime.create({
            data: { ...data, date: new Date(data.date) },
        });
        return this.toResponse(ot);
    }
    async approve(id, status) {
        const ot = await this.prisma.overtime.update({
            where: { id },
            data: { status, approvedAt: new Date() },
        });
        return this.toResponse(ot);
    }
    async list(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        const ots = await this.prisma.overtime.findMany({ where, orderBy: { submittedAt: 'desc' } });
        return { overtime: ots.map((o) => this.toResponse(o)) };
    }
    toResponse(o) {
        return {
            id: o.id, employeeId: o.employeeId, date: o.date?.toISOString() || '',
            hours: o.hours, rate: o.rate, reason: o.reason, status: o.status,
            submittedAt: o.submittedAt?.toISOString() || '',
        };
    }
};
exports.OvertimeService = OvertimeService;
exports.OvertimeService = OvertimeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], OvertimeService);
//# sourceMappingURL=overtime.service.js.map