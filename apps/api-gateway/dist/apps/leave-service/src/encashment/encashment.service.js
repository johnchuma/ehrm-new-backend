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
exports.EncashmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let EncashmentService = class EncashmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const enc = await this.prisma.leaveEncashment.create({ data });
        return this.toResponse(enc);
    }
    async approve(id, status) {
        const enc = await this.prisma.leaveEncashment.update({
            where: { id },
            data: { status, processedAt: status === 'Processed' ? new Date() : null },
        });
        return this.toResponse(enc);
    }
    async list(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        const encs = await this.prisma.leaveEncashment.findMany({ where, orderBy: { submittedAt: 'desc' } });
        return { encashments: encs.map((e) => this.toResponse(e)) };
    }
    toResponse(e) {
        return {
            id: e.id, companyId: e.companyId, employeeId: e.employeeId,
            leaveTypeId: e.leaveTypeId, days: e.days, amount: e.amount,
            status: e.status, submittedAt: e.submittedAt?.toISOString() || '',
        };
    }
};
exports.EncashmentService = EncashmentService;
exports.EncashmentService = EncashmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], EncashmentService);
//# sourceMappingURL=encashment.service.js.map