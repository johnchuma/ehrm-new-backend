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
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let ContractService = class ContractService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const c = await this.prisma.contract.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                probationEndDate: data.probationEndDate ? new Date(data.probationEndDate) : null,
            },
        });
        return this.toResponse(c);
    }
    async get(id) {
        const c = await this.prisma.contract.findUnique({ where: { id } });
        if (!c)
            throw decorators_1.GrpcErrors.NOT_FOUND('Contract not found');
        return this.toResponse(c);
    }
    async update(id, data) {
        if (data.endDate)
            data.endDate = new Date(data.endDate);
        const c = await this.prisma.contract.update({ where: { id }, data });
        return this.toResponse(c);
    }
    async terminate(id, reason, terminationDate) {
        const c = await this.prisma.contract.update({
            where: { id },
            data: {
                status: 'Terminated',
                terminationReason: reason,
                terminatedAt: new Date(terminationDate),
            },
        });
        return this.toResponse(c);
    }
    async renew(id, newEndDate, newSalary) {
        const c = await this.prisma.contract.update({
            where: { id },
            data: { endDate: new Date(newEndDate), basicSalary: newSalary, status: 'Active' },
        });
        return this.toResponse(c);
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.employeeId)
            where.employeeId = filters.employeeId;
        if (filters.status)
            where.status = filters.status;
        const items = await this.prisma.contract.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { contracts: items.map((c) => this.toResponse(c)) };
    }
    toResponse(c) {
        return {
            id: c.id, companyId: c.companyId, employeeId: c.employeeId,
            employeeName: c.employeeName, type: c.type,
            startDate: c.startDate?.toISOString() || '',
            endDate: c.endDate?.toISOString() || '',
            probationEndDate: c.probationEndDate?.toISOString() || '',
            basicSalary: c.basicSalary, terms: c.terms, status: c.status,
            createdAt: c.createdAt?.toISOString() || '',
            terminatedAt: c.terminatedAt?.toISOString() || '',
        };
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], ContractService);
//# sourceMappingURL=contracts.service.js.map