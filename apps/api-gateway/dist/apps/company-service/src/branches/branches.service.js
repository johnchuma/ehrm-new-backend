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
exports.BranchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let BranchService = class BranchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBranch(data) {
        const branch = await this.prisma.branch.create({ data });
        return this.toBranchResponse(branch);
    }
    async getBranch(id) {
        const branch = await this.prisma.branch.findUnique({ where: { id } });
        if (!branch)
            throw decorators_1.GrpcErrors.NOT_FOUND('Branch not found');
        return this.toBranchResponse(branch);
    }
    async updateBranch(id, data) {
        const branch = await this.prisma.branch.update({ where: { id }, data });
        return this.toBranchResponse(branch);
    }
    async deleteBranch(id) {
        await this.prisma.branch.delete({ where: { id } });
        return { success: true, message: 'Branch deleted' };
    }
    async listBranches(companyId) {
        const branches = await this.prisma.branch.findMany({
            where: { companyId },
            orderBy: { name: 'asc' },
        });
        return { branches: branches.map((b) => this.toBranchResponse(b)) };
    }
    toBranchResponse(b) {
        return {
            id: b.id, companyId: b.companyId, name: b.name, code: b.code,
            address: b.address, city: b.city, country: b.country,
            phone: b.phone, email: b.email, managerId: b.managerId,
            isActive: b.isActive, createdAt: b.createdAt?.toISOString() || '',
        };
    }
};
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], BranchService);
//# sourceMappingURL=branches.service.js.map