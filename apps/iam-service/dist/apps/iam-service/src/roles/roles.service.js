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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let RoleService = class RoleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRole(data) {
        const existing = await this.prisma.role.findUnique({
            where: { name_companyId: { name: data.name, companyId: data.companyId || '' } },
        });
        if (existing) {
            throw decorators_1.GrpcErrors.ALREADY_EXISTS('Role with this name already exists');
        }
        const role = await this.prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
                companyId: data.companyId,
                permissions: data.permissionIds
                    ? {
                        create: data.permissionIds.map((permissionId) => ({ permissionId })),
                    }
                    : undefined,
            },
            include: {
                permissions: { include: { permission: true } },
            },
        });
        return this.toRoleResponse(role);
    }
    async getRole(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: { include: { permission: true } },
            },
        });
        if (!role) {
            throw decorators_1.GrpcErrors.NOT_FOUND('Role not found');
        }
        return this.toRoleResponse(role);
    }
    async updateRole(id, data) {
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.permissionIds) {
            await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
            await this.prisma.rolePermission.createMany({
                data: data.permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
            });
        }
        const role = await this.prisma.role.update({
            where: { id },
            data: updateData,
            include: {
                permissions: { include: { permission: true } },
            },
        });
        return this.toRoleResponse(role);
    }
    async deleteRole(id) {
        await this.prisma.role.delete({ where: { id } });
        return { success: true, message: 'Role deleted successfully' };
    }
    async listRoles(companyId) {
        const roles = await this.prisma.role.findMany({
            where: { OR: [{ companyId }, { isSystem: true }] },
            include: {
                permissions: { include: { permission: true } },
            },
            orderBy: { name: 'asc' },
        });
        return { roles: roles.map((r) => this.toRoleResponse(r)) };
    }
    async assignPermission(roleId, permissionId) {
        const existing = await this.prisma.rolePermission.findUnique({
            where: { roleId_permissionId: { roleId, permissionId } },
        });
        if (existing) {
            throw decorators_1.GrpcErrors.ALREADY_EXISTS('Role already has this permission');
        }
        await this.prisma.rolePermission.create({ data: { roleId, permissionId } });
        return this.getRole(roleId);
    }
    toRoleResponse(role) {
        return {
            id: role.id,
            name: role.name,
            description: role.description,
            companyId: role.companyId,
            isSystem: role.isSystem,
            permissions: (role.permissions || []).map((rp) => ({
                id: rp.permission.id,
                name: rp.permission.name,
                resource: rp.permission.resource,
                action: rp.permission.action,
                description: rp.permission.description,
            })),
            createdAt: role.createdAt?.toISOString() || '',
        };
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], RoleService);
//# sourceMappingURL=roles.service.js.map