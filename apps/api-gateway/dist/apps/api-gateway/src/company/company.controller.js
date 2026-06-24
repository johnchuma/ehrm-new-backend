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
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const companies_service_1 = require("../../../company-service/src/companies/companies.service");
const branches_service_1 = require("../../../company-service/src/branches/branches.service");
const departments_service_1 = require("../../../company-service/src/departments/departments.service");
const settings_service_1 = require("../../../company-service/src/settings/settings.service");
let CompanyController = class CompanyController {
    companyService;
    branchService;
    departmentService;
    settingsService;
    constructor(companyService, branchService, departmentService, settingsService) {
        this.companyService = companyService;
        this.branchService = branchService;
        this.departmentService = departmentService;
        this.settingsService = settingsService;
    }
    createCompany(body) { return this.companyService.createCompany(body); }
    listCompanies(query) { return this.companyService.listCompanies(query.page, query.pageSize, query.search, query.status); }
    getCompany(id) { return this.companyService.getCompany(id); }
    updateCompany(id, body) { return this.companyService.updateCompany(id, body); }
    deleteCompany(id) { return this.companyService.deleteCompany(id); }
    createBranch(body) { return this.branchService.createBranch(body); }
    listBranches(query) { return this.branchService.listBranches(query.companyId); }
    getBranch(id) { return this.branchService.getBranch(id); }
    updateBranch(id, body) { return this.branchService.updateBranch(id, body); }
    deleteBranch(id) { return this.branchService.deleteBranch(id); }
    createDepartment(body) { return this.departmentService.createDepartment(body); }
    listDepartments(query) { return this.departmentService.listDepartments(query.companyId, query.branchId); }
    getDepartment(id) { return this.departmentService.getDepartment(id); }
    updateDepartment(id, body) { return this.departmentService.updateDepartment(id, body); }
    deleteDepartment(id) { return this.departmentService.deleteDepartment(id); }
    getSettings(companyId) { return this.settingsService.getSettings(companyId); }
    updateSettings(companyId, body) { return this.settingsService.updateSettings(companyId, body); }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_1.Post)('companies'),
    (0, swagger_1.ApiOperation)({ summary: 'Create company' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['name', 'registrationNumber', 'taxId', 'address', 'phone', 'email', 'industry'],
            properties: {
                name: { type: 'string', example: 'Acacia Group Ltd' },
                registrationNumber: { type: 'string', example: 'BN-2024-00156' },
                taxId: { type: 'string', example: 'TIN-123-456-789' },
                address: { type: 'string', example: '15 Ohio Street, Dar es Salaam, Tanzania' },
                phone: { type: 'string', example: '+255222123456' },
                email: { type: 'string', example: 'info@acacia.co.tz' },
                industry: { type: 'string', example: 'Agriculture & Export' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "createCompany", null);
__decorate([
    (0, common_1.Get)('companies'),
    (0, swagger_1.ApiOperation)({ summary: 'List companies' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "listCompanies", null);
__decorate([
    (0, common_1.Get)('companies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get company' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "getCompany", null);
__decorate([
    (0, common_1.Put)('companies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update company' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Acacia Group Ltd' },
                registrationNumber: { type: 'string', example: 'BN-2024-00156' },
                taxId: { type: 'string', example: 'TIN-123-456-789' },
                address: { type: 'string', example: '15 Ohio Street, Dar es Salaam, Tanzania' },
                phone: { type: 'string', example: '+255222123456' },
                email: { type: 'string', example: 'info@acacia.co.tz' },
                industry: { type: 'string', example: 'Agriculture & Export' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "updateCompany", null);
__decorate([
    (0, common_1.Delete)('companies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete company' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "deleteCompany", null);
__decorate([
    (0, common_1.Post)('branches'),
    (0, swagger_1.ApiOperation)({ summary: 'Create branch' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'address', 'phone', 'isHeadquarters'],
            properties: {
                companyId: { type: 'string', example: 'cmp_9f8e7d6c5b4a' },
                name: { type: 'string', example: 'Acacia Dar es Salaam Branch' },
                address: { type: 'string', example: '23 Morogoro Road, Dar es Salaam, Tanzania' },
                phone: { type: 'string', example: '+255222987654' },
                isHeadquarters: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "createBranch", null);
__decorate([
    (0, common_1.Get)('branches'),
    (0, swagger_1.ApiOperation)({ summary: 'List branches' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "listBranches", null);
__decorate([
    (0, common_1.Get)('branches/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "getBranch", null);
__decorate([
    (0, common_1.Put)('branches/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Acacia Mwanza Branch' },
                address: { type: 'string', example: '45 Kenyatta Drive, Mwanza, Tanzania' },
                phone: { type: 'string', example: '+255282456789' },
                isHeadquarters: { type: 'boolean', example: false },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "updateBranch", null);
__decorate([
    (0, common_1.Delete)('branches/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "deleteBranch", null);
__decorate([
    (0, common_1.Post)('departments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create department' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'code', 'managerId', 'parentId'],
            properties: {
                companyId: { type: 'string', example: 'cmp_9f8e7d6c5b4a' },
                name: { type: 'string', example: 'Human Resources' },
                code: { type: 'string', example: 'HR-001' },
                managerId: { type: 'string', example: 'usr_a1b2c3d4e5f6' },
                parentId: { type: 'string', example: 'dept_001', nullable: true },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "createDepartment", null);
__decorate([
    (0, common_1.Get)('departments'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "listDepartments", null);
__decorate([
    (0, common_1.Get)('departments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "getDepartment", null);
__decorate([
    (0, common_1.Put)('departments/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Finance & Accounting' },
                code: { type: 'string', example: 'FIN-001' },
                managerId: { type: 'string', example: 'usr_f6g7h8i9j0k1' },
                parentId: { type: 'string', example: 'dept_001', nullable: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "updateDepartment", null);
__decorate([
    (0, common_1.Delete)('departments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "deleteDepartment", null);
__decorate([
    (0, common_1.Get)('settings/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings/:companyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update company settings' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                currency: { type: 'string', example: 'TZS' },
                timezone: { type: 'string', example: 'Africa/Dar_es_Salaam' },
                dateFormat: { type: 'string', example: 'DD/MM/YYYY' },
                leavePolicy: { type: 'string', example: '21 working days annual leave' },
                workingHours: { type: 'string', example: '08:00 - 17:00, Monday to Friday' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CompanyController.prototype, "updateSettings", null);
exports.CompanyController = CompanyController = __decorate([
    (0, swagger_1.ApiTags)('Company'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('company'),
    __metadata("design:paramtypes", [companies_service_1.CompanyService,
        branches_service_1.BranchService,
        departments_service_1.DepartmentService,
        settings_service_1.SettingsService])
], CompanyController);
//# sourceMappingURL=company.controller.js.map