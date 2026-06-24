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
exports.LeaveTypeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let LeaveTypeService = class LeaveTypeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const type = await this.prisma.leaveType.create({ data });
        return this.toResponse(type);
    }
    async get(id) {
        const t = await this.prisma.leaveType.findUnique({ where: { id } });
        if (!t)
            throw decorators_1.GrpcErrors.NOT_FOUND('Leave type not found');
        return this.toResponse(t);
    }
    async update(id, data) {
        const t = await this.prisma.leaveType.update({ where: { id }, data });
        return this.toResponse(t);
    }
    async delete(id) {
        await this.prisma.leaveType.delete({ where: { id } });
        return { success: true, message: 'Leave type deleted' };
    }
    async list(companyId) {
        const types = await this.prisma.leaveType.findMany({ where: { companyId }, orderBy: { name: 'asc' } });
        return { types: types.map((t) => this.toResponse(t)) };
    }
    toResponse(t) {
        return {
            id: t.id, companyId: t.companyId, name: t.name,
            entitlementDays: t.entitlementDays, color: t.color, accrual: t.accrual,
            carryForward: t.carryForward, eligibility: t.eligibility, maxCarry: t.maxCarry,
            createdAt: t.createdAt?.toISOString() || '',
        };
    }
};
exports.LeaveTypeService = LeaveTypeService;
exports.LeaveTypeService = LeaveTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], LeaveTypeService);
//# sourceMappingURL=leave-types.service.js.map