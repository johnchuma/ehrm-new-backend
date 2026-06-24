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
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let TaskService = class TaskService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const t = await this.prisma.task.create({
            data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null },
        });
        return this.toResponse(t);
    }
    async get(id) {
        const t = await this.prisma.task.findUnique({ where: { id } });
        if (!t)
            throw decorators_1.GrpcErrors.NOT_FOUND('Task not found');
        return this.toResponse(t);
    }
    async update(id, data) {
        if (data.dueDate)
            data.dueDate = new Date(data.dueDate);
        const t = await this.prisma.task.update({ where: { id }, data });
        return this.toResponse(t);
    }
    async delete(id) {
        await this.prisma.task.delete({ where: { id } });
        return { success: true, message: 'Task deleted' };
    }
    async assign(id, assigneeId) {
        const t = await this.prisma.task.update({ where: { id }, data: { assigneeId } });
        return this.toResponse(t);
    }
    async complete(id) {
        const t = await this.prisma.task.update({
            where: { id },
            data: { status: 'Completed', completedAt: new Date() },
        });
        return this.toResponse(t);
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.assigneeId)
            where.assigneeId = filters.assigneeId;
        if (filters.status)
            where.status = filters.status;
        if (filters.priority)
            where.priority = filters.priority;
        const items = await this.prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { tasks: items.map((t) => this.toResponse(t)) };
    }
    toResponse(t) {
        return {
            id: t.id, companyId: t.companyId, title: t.title, description: t.description,
            priority: t.priority, dueDate: t.dueDate?.toISOString() || '',
            status: t.status, assigneeId: t.assigneeId, assigneeName: t.assigneeName,
            category: t.category, createdBy: t.createdBy,
            createdAt: t.createdAt?.toISOString() || '',
            completedAt: t.completedAt?.toISOString() || '',
        };
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], TaskService);
//# sourceMappingURL=tasks.service.js.map