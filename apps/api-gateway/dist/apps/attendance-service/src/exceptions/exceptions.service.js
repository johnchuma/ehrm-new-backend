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
exports.ExceptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let ExceptionService = class ExceptionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const exc = await this.prisma.attendanceException.create({
            data: { ...data, date: new Date(data.date) },
        });
        return this.toResponse(exc);
    }
    async resolve(id, notes) {
        const exc = await this.prisma.attendanceException.update({
            where: { id },
            data: { status: 'Resolved', notes, resolvedAt: new Date() },
        });
        return this.toResponse(exc);
    }
    async list(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        const exceptions = await this.prisma.attendanceException.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { exceptions: exceptions.map((e) => this.toResponse(e)) };
    }
    toResponse(e) {
        return {
            id: e.id, employeeId: e.employeeId, type: e.type, date: e.date?.toISOString() || '',
            details: e.details, severity: e.severity, flagged: e.flagged,
            status: e.status, createdAt: e.createdAt?.toISOString() || '',
        };
    }
};
exports.ExceptionService = ExceptionService;
exports.ExceptionService = ExceptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], ExceptionService);
//# sourceMappingURL=exceptions.service.js.map