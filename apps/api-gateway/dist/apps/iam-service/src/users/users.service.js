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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const auth_service_1 = require("../../../../libs/common/src/auth/auth.service");
const decorators_1 = require("../../../../libs/common/src/decorators");
let UserService = class UserService {
    prisma;
    authService;
    constructor(prisma, authService) {
        this.prisma = prisma;
        this.authService = authService;
    }
    async createUser(data) {
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email.toLowerCase() },
                    ...(data.phone ? [{ phone: data.phone }] : []),
                ],
            },
        });
        if (existing) {
            throw decorators_1.GrpcErrors.ALREADY_EXISTS('User with this email or phone already exists');
        }
        const hashedPassword = await this.authService.hashPassword(data.password);
        const user = await this.prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                phone: data.phone,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                fullName: `${data.firstName} ${data.lastName}`,
                companyId: data.companyId,
                employeeId: data.employeeId,
                isActive: data.isActive !== undefined ? data.isActive : true,
                roles: data.roleIds
                    ? {
                        create: data.roleIds.map((roleId) => ({ roleId })),
                    }
                    : undefined,
            },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: { include: { permission: true } },
                            },
                        },
                    },
                },
            },
        });
        return this.toUserResponse(user);
    }
    async getUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: { include: { permission: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw decorators_1.GrpcErrors.NOT_FOUND('User not found');
        }
        return this.toUserResponse(user);
    }
    async updateUser(id, data) {
        const updateData = {};
        if (data.email)
            updateData.email = data.email.toLowerCase();
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.firstName)
            updateData.firstName = data.firstName;
        if (data.lastName)
            updateData.lastName = data.lastName;
        if (data.firstName || data.lastName) {
            const existing = await this.prisma.user.findUnique({ where: { id } });
            if (existing) {
                updateData.fullName = `${data.firstName || existing.firstName} ${data.lastName || existing.lastName}`;
            }
        }
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.roleIds) {
            await this.prisma.userRole.deleteMany({ where: { userId: id } });
            await this.prisma.userRole.createMany({
                data: data.roleIds.map((roleId) => ({ userId: id, roleId })),
            });
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: { include: { permission: true } },
                            },
                        },
                    },
                },
            },
        });
        return this.toUserResponse(user);
    }
    async deleteUser(id) {
        await this.prisma.user.delete({ where: { id } });
        return { success: true, message: 'User deleted successfully' };
    }
    async listUsers(companyId, page = 1, pageSize = 20, search) {
        const where = { companyId };
        if (search) {
            where.OR = [
                { email: { contains: search } },
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { fullName: { contains: search } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    roles: {
                        include: {
                            role: {
                                include: {
                                    permissions: { include: { permission: true } },
                                },
                            },
                        },
                    },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users: users.map((u) => this.toUserResponse(u)),
            total,
            page,
            pageSize,
        };
    }
    async assignRole(userId, roleId) {
        const existing = await this.prisma.userRole.findUnique({
            where: { userId_roleId: { userId, roleId } },
        });
        if (existing) {
            throw decorators_1.GrpcErrors.ALREADY_EXISTS('User already has this role');
        }
        await this.prisma.userRole.create({ data: { userId, roleId } });
        return this.getUser(userId);
    }
    async removeRole(userId, roleId) {
        await this.prisma.userRole.delete({
            where: { userId_roleId: { userId, roleId } },
        });
        return this.getUser(userId);
    }
    toUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            companyId: user.companyId,
            employeeId: user.employeeId,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            roles: (user.roles || []).map((ur) => ({
                id: ur.role.id,
                name: ur.role.name,
                description: ur.role.description,
                companyId: ur.role.companyId,
                isSystem: ur.role.isSystem,
                permissions: (ur.role.permissions || []).map((rp) => ({
                    id: rp.permission.id,
                    name: rp.permission.name,
                    resource: rp.permission.resource,
                    action: rp.permission.action,
                    description: rp.permission.description,
                })),
                createdAt: ur.role.createdAt?.toISOString() || '',
            })),
            createdAt: user.createdAt?.toISOString() || '',
            updatedAt: user.updatedAt?.toISOString() || '',
            lastLoginAt: user.lastLoginAt?.toISOString() || '',
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object, auth_service_1.AuthService])
], UserService);
//# sourceMappingURL=users.service.js.map