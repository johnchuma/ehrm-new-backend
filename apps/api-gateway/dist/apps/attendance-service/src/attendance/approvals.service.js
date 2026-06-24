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
exports.ApprovalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let ApprovalService = class ApprovalService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const approval = await this.prisma.attendanceApproval.create({ data });
        return this.toResponse(approval);
    }
    async decide(id, status) {
        const approval = await this.prisma.attendanceApproval.update({
            where: { id },
            data: { status },
        });
        return this.toResponse(approval);
    }
    async list(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        const approvals = await this.prisma.attendanceApproval.findMany({ where, orderBy: { submittedAt: 'desc' } });
        return { approvals: approvals.map((a) => this.toResponse(a)) };
    }
    toResponse(a) {
        return {
            id: a.id, employeeId: a.employeeId, type: a.type, date: a.date?.toISOString() || '',
            detail: a.detail, reviewer: a.reviewer, status: a.status,
            submittedAt: a.submittedAt?.toISOString() || '',
        };
    }
};
exports.ApprovalService = ApprovalService;
exports.ApprovalService = ApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], ApprovalService);
//# sourceMappingURL=approvals.service.js.map