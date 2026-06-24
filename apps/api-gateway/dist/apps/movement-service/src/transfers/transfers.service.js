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
exports.TransferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let TransferService = class TransferService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const t = await this.prisma.transfer.create({
            data: { ...data, effectiveDate: new Date(data.effectiveDate) },
        });
        return this.toResponse(t);
    }
    async approve(id, status) {
        const t = await this.prisma.transfer.update({ where: { id }, data: { status } });
        return this.toResponse(t);
    }
    async list(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        const items = await this.prisma.transfer.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { transfers: items.map((t) => this.toResponse(t)) };
    }
    toResponse(t) {
        return {
            id: t.id, companyId: t.companyId, employeeId: t.employeeId,
            employeeName: t.employeeName, fromBranchId: t.fromBranchId,
            fromDepartmentId: t.fromDepartmentId, toBranchId: t.toBranchId,
            toDepartmentId: t.toDepartmentId, effectiveDate: t.effectiveDate?.toISOString() || '',
            reason: t.reason, status: t.status, createdAt: t.createdAt?.toISOString() || '',
        };
    }
};
exports.TransferService = TransferService;
exports.TransferService = TransferService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], TransferService);
//# sourceMappingURL=transfers.service.js.map