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
exports.CaseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let CaseService = class CaseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const c = await this.prisma.disciplinaryCase.create({
            data: { ...data, date: new Date(data.date) },
        });
        return this.toResponse(c);
    }
    async get(id) {
        const c = await this.prisma.disciplinaryCase.findUnique({ where: { id } });
        if (!c)
            throw decorators_1.GrpcErrors.NOT_FOUND('Case not found');
        return this.toResponse(c);
    }
    async update(id, data) {
        const c = await this.prisma.disciplinaryCase.update({ where: { id }, data });
        return this.toResponse(c);
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.status)
            where.status = filters.status;
        if (filters.severity)
            where.severity = filters.severity;
        const items = await this.prisma.disciplinaryCase.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { cases: items.map((c) => this.toResponse(c)) };
    }
    toResponse(c) {
        return {
            id: c.id, companyId: c.companyId, employeeId: c.employeeId,
            employeeName: c.employeeName, incident: c.incident, description: c.description,
            date: c.date?.toISOString() || '', reportedBy: c.reportedBy,
            severity: c.severity, status: c.status,
            createdAt: c.createdAt?.toISOString() || '',
        };
    }
};
exports.CaseService = CaseService;
exports.CaseService = CaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], CaseService);
//# sourceMappingURL=cases.service.js.map