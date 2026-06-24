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
exports.IamController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const users_service_1 = require("../../../iam-service/src/users/users.service");
const roles_service_1 = require("../../../iam-service/src/roles/roles.service");
let IamController = class IamController {
    userService;
    roleService;
    constructor(userService, roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }
    createUser(body) { return this.userService.createUser(body); }
    listUsers(query) { return this.userService.listUsers(query.companyId, query.page, query.pageSize, query.search); }
    getUser(id) { return this.userService.getUser(id); }
    updateUser(id, body) { return this.userService.updateUser(id, body); }
    deleteUser(id) { return this.userService.deleteUser(id); }
    assignRole(userId, roleId) {
        return this.userService.assignRole(userId, roleId);
    }
    removeRole(userId, roleId) {
        return this.userService.removeRole(userId, roleId);
    }
    createRole(body) { return this.roleService.createRole(body); }
    listRoles(query) { return this.roleService.listRoles(query.companyId); }
    getRole(id) { return this.roleService.getRole(id); }
    updateRole(id, body) { return this.roleService.updateRole(id, body); }
    deleteRole(id) { return this.roleService.deleteRole(id); }
};
exports.IamController = IamController;
__decorate([
    (0, common_1.Post)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Create user' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['email', 'phone', 'password', 'firstName', 'lastName', 'companyId', 'role'],
            properties: {
                email: { type: 'string', example: 'john.makamba@acacia.co.tz' },
                phone: { type: 'string', example: '+255712345678' },
                password: { type: 'string', example: 'P@ssw0rd123' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Makamba' },
                companyId: { type: 'string', example: 'cmp_9f8e7d6c5b4a' },
                role: { type: 'string', example: 'admin' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List users' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "getUser", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'john.makamba@acacia.co.tz' },
                phone: { type: 'string', example: '+255712345678' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Makamba' },
                role: { type: 'string', example: 'manager' },
                status: { type: 'string', example: 'active' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('users/:userId/roles/:roleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign role to user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)('users/:userId/roles/:roleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove role from user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "removeRole", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Create role' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['name', 'description', 'permissions'],
            properties: {
                name: { type: 'string', example: 'HR Manager' },
                description: { type: 'string', example: 'Manages human resources operations and employee records' },
                permissions: { type: 'array', items: { type: 'string' }, example: ['users.read', 'users.write', 'departments.read'] },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "createRole", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'List roles' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "listRoles", null);
__decorate([
    (0, common_1.Get)('roles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get role by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "getRole", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update role' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Senior HR Manager' },
                description: { type: 'string', example: 'Senior role managing all human resources operations' },
                permissions: { type: 'array', items: { type: 'string' }, example: ['users.read', 'users.write', 'users.delete', 'departments.read', 'departments.write'] },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete role' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IamController.prototype, "deleteRole", null);
exports.IamController = IamController = __decorate([
    (0, swagger_1.ApiTags)('IAM - Users & Roles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('iam'),
    __metadata("design:paramtypes", [users_service_1.UserService,
        roles_service_1.RoleService])
], IamController);
//# sourceMappingURL=iam.controller.js.map