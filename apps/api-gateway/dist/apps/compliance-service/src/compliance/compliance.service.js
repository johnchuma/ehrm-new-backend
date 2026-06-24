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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let ComplianceService = class ComplianceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const r = await this.prisma.complianceRequirement.create({
            data: { ...data, dueDate: new Date(data.dueDate) },
        });
        return this.toResponse(r);
    }
    async get(id) {
        const r = await this.prisma.complianceRequirement.findUnique({ where: { id } });
        if (!r)
            throw decorators_1.GrpcErrors.NOT_FOUND('Requirement not found');
        return this.toResponse(r);
    }
    async update(id, data) {
        const r = await this.prisma.complianceRequirement.update({ where: { id }, data });
        return this.toResponse(r);
    }
    async list(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        const items = await this.prisma.complianceRequirement.findMany({ where });
        return { requirements: items.map((r) => this.toResponse(r)) };
    }
    toResponse(r) {
        return {
            id: r.id, companyId: r.companyId, name: r.name, description: r.description,
            authority: r.authority, frequency: r.frequency,
            dueDate: r.dueDate?.toISOString() || '', status: r.status,
            createdAt: r.createdAt?.toISOString() || '',
        };
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map