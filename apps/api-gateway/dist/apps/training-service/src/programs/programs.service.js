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
exports.ProgramService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let ProgramService = class ProgramService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const p = await this.prisma.trainingProgram.create({
            data: { ...data, startDate: new Date(data.startDate), endDate: new Date(data.endDate) },
        });
        return this.toResponse(p);
    }
    async get(id) {
        const p = await this.prisma.trainingProgram.findUnique({ where: { id } });
        if (!p)
            throw decorators_1.GrpcErrors.NOT_FOUND('Program not found');
        return this.toResponse(p);
    }
    async update(id, data) {
        if (data.startDate)
            data.startDate = new Date(data.startDate);
        if (data.endDate)
            data.endDate = new Date(data.endDate);
        const p = await this.prisma.trainingProgram.update({ where: { id }, data });
        return this.toResponse(p);
    }
    async delete(id) {
        await this.prisma.trainingProgram.delete({ where: { id } });
        return { success: true, message: 'Program deleted' };
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.status)
            where.status = filters.status;
        if (filters.category)
            where.category = filters.category;
        const programs = await this.prisma.trainingProgram.findMany({ where, orderBy: { startDate: 'desc' } });
        return { programs: programs.map((p) => this.toResponse(p)) };
    }
    toResponse(p) {
        return {
            id: p.id, companyId: p.companyId, title: p.title, description: p.description,
            category: p.category, trainer: p.trainer,
            startDate: p.startDate?.toISOString() || '',
            endDate: p.endDate?.toISOString() || '',
            location: p.location, maxParticipants: p.maxParticipants,
            enrolled: p.enrolled, status: p.status,
            createdAt: p.createdAt?.toISOString() || '',
        };
    }
};
exports.ProgramService = ProgramService;
exports.ProgramService = ProgramService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], ProgramService);
//# sourceMappingURL=programs.service.js.map