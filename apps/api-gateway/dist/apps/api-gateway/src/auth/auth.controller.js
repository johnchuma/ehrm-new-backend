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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const decorators_1 = require("../../../../libs/common/src/decorators");
const auth_service_1 = require("../../../iam-service/src/auth/auth.service");
const companies_service_1 = require("../../../company-service/src/companies/companies.service");
let AuthController = class AuthController {
    iamAuthService;
    companyService;
    constructor(iamAuthService, companyService) {
        this.iamAuthService = iamAuthService;
        this.companyService = companyService;
    }
    async loginWithEmail(body) {
        return this.iamAuthService.loginWithEmail(body.email, body.password);
    }
    async loginWithPhone(body) {
        return this.iamAuthService.loginWithPhone(body.phone, body.password);
    }
    async register(body) {
        return this.iamAuthService.register(body);
    }
    async validateToken(body) {
        return this.iamAuthService.validateToken(body.token);
    }
    async refreshToken(body) {
        return this.iamAuthService.refreshToken(body.refreshToken);
    }
    async forgotPassword(body) {
        return this.iamAuthService.forgotPassword(body.email);
    }
    async resetPassword(body) {
        return this.iamAuthService.resetPassword(body.token, body.newPassword);
    }
    async changePassword(body) {
        return this.iamAuthService.changePassword(body.userId, body.oldPassword, body.newPassword);
    }
    async logout(body) {
        return this.iamAuthService.logout(body.userId);
    }
    async registerWorkspace(body) {
        const slug = body.company
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const currencyCode = body.currency?.split(' ')[0] || 'TZS';
        const company = await this.companyService.createCompany({
            name: body.company,
            slug,
            email: body.email,
            phone: body.phone || '',
            country: body.country || 'Tanzania',
            currency: currencyCode,
            timezone: 'Africa/Dar_es_Salaam',
            subscriptionPlan: body.plan || 'FREE',
            industry: body.sector || '',
            size: body.size || '',
        });
        const result = await this.iamAuthService.register({
            email: body.email,
            phone: body.phone || '',
            password: body.password,
            firstName: body.fname,
            lastName: body.lname,
            companyId: company.id,
        });
        return {
            ...result,
            company,
            workspaceType: body.workspaceType,
            plan: body.plan,
            billing: body.billing || 'monthly',
        };
    }
    async me(req) {
        return req.user;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'hr.admin@acaciagroup.co.tz' },
                password: { type: 'string', example: 'demo1234' },
                companyId: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginWithEmail", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('login/phone'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Login with phone and password' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                phone: { type: 'string', example: '+255712345678' },
                password: { type: 'string' },
                companyId: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginWithPhone", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                phone: { type: 'string' },
                password: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                companyId: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Validate JWT token' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['token'],
            properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['refreshToken'],
            properties: {
                refreshToken: { type: 'string', example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['email'],
            properties: {
                email: { type: 'string', example: 'hr.admin@acaciagroup.co.tz' },
                companyId: { type: 'string', example: 'comp_001' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['token', 'newPassword'],
            properties: {
                token: { type: 'string', example: 'reset-token-from-email' },
                newPassword: { type: 'string', example: 'NewP@ssw0rd!' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Change password' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['userId', 'oldPassword', 'newPassword'],
            properties: {
                userId: { type: 'string', example: 'user_001' },
                oldPassword: { type: 'string', example: 'demo1234' },
                newPassword: { type: 'string', example: 'NewP@ssw0rd!' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: { type: 'string', example: 'user_001' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('register-workspace'),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new workspace with company and admin user' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['workspaceType', 'company', 'fname', 'lname', 'email', 'password', 'plan'],
            properties: {
                workspaceType: { type: 'string', enum: ['single', 'multi'], example: 'single' },
                company: { type: 'string', example: 'Acacia Group Ltd' },
                employees: { type: 'number', example: 1284 },
                sector: { type: 'string', example: 'Manufacturing' },
                size: { type: 'string', example: '201–500' },
                country: { type: 'string', example: 'Tanzania' },
                currency: { type: 'string', example: 'TZS (Tanzanian Shilling)' },
                fname: { type: 'string', example: 'Joyce' },
                lname: { type: 'string', example: 'Massawe' },
                email: { type: 'string', example: 'hr.admin@acaciagroup.co.tz' },
                phone: { type: 'string', example: '+255712000000' },
                password: { type: 'string', example: 'SecureP@ss123' },
                plan: { type: 'string', example: 'HR Professional' },
                billing: { type: 'string', enum: ['monthly', 'annual'], example: 'monthly' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerWorkspace", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.IamAuthService,
        companies_service_1.CompanyService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map