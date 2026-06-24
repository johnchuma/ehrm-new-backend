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
exports.ActionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let ActionService = class ActionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const a = await this.prisma.disciplinaryAction.create({
            data: { ...data, effectiveDate: new Date(data.effectiveDate) },
        });
        return this.toResponse(a);
    }
    async approve(id, status) {
        const a = await this.prisma.disciplinaryAction.update({ where: { id }, data: { status } });
        return this.toResponse(a);
    }
    async list(caseId) {
        const items = await this.prisma.disciplinaryAction.findMany({ where: { caseId } });
        return { actions: items.map((a) => this.toResponse(a)) };
    }
    toResponse(a) {
        return {
            id: a.id, caseId: a.caseId, type: a.type, description: a.description,
            effectiveDate: a.effectiveDate?.toISOString() || '',
            issuedBy: a.issuedBy, status: a.status,
            createdAt: a.createdAt?.toISOString() || '',
        };
    }
};
exports.ActionService = ActionService;
exports.ActionService = ActionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], ActionService);
//# sourceMappingURL=actions.service.js.map