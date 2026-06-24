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
exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let DepartmentService = class DepartmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDepartment(data) {
        const dept = await this.prisma.department.create({ data });
        return this.toDeptResponse(dept);
    }
    async getDepartment(id) {
        const dept = await this.prisma.department.findUnique({ where: { id } });
        if (!dept)
            throw decorators_1.GrpcErrors.NOT_FOUND('Department not found');
        return this.toDeptResponse(dept);
    }
    async updateDepartment(id, data) {
        const dept = await this.prisma.department.update({ where: { id }, data });
        return this.toDeptResponse(dept);
    }
    async deleteDepartment(id) {
        await this.prisma.department.delete({ where: { id } });
        return { success: true, message: 'Department deleted' };
    }
    async listDepartments(companyId, branchId) {
        const where = { companyId };
        if (branchId)
            where.branchId = branchId;
        const depts = await this.prisma.department.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        return { departments: depts.map((d) => this.toDeptResponse(d)) };
    }
    toDeptResponse(d) {
        return {
            id: d.id, companyId: d.companyId, branchId: d.branchId,
            name: d.name, code: d.code, description: d.description,
            headId: d.headId, parentId: d.parentId, isActive: d.isActive,
            createdAt: d.createdAt?.toISOString() || '',
        };
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], DepartmentService);
//# sourceMappingURL=departments.service.js.map