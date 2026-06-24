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
exports.OnboardingTaskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let OnboardingTaskService = class OnboardingTaskService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const t = await this.prisma.onboardingTask.create({
            data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null },
        });
        return this.toResponse(t);
    }
    async complete(id) {
        const t = await this.prisma.onboardingTask.update({
            where: { id },
            data: { status: 'Completed', completedAt: new Date() },
        });
        return this.toResponse(t);
    }
    async list(onboardingId) {
        const tasks = await this.prisma.onboardingTask.findMany({ where: { onboardingId } });
        return { tasks: tasks.map((t) => this.toResponse(t)) };
    }
    toResponse(t) {
        return {
            id: t.id, onboardingId: t.onboardingId, title: t.title,
            description: t.description, assignee: t.assignee,
            dueDate: t.dueDate?.toISOString() || '', status: t.status,
            completedAt: t.completedAt?.toISOString() || '',
        };
    }
};
exports.OnboardingTaskService = OnboardingTaskService;
exports.OnboardingTaskService = OnboardingTaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], OnboardingTaskService);
//# sourceMappingURL=tasks.service.js.map