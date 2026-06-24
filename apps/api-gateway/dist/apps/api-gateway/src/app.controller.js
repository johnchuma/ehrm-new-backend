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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const index_1 = require("../../../libs/common/src/decorators/index");
let AppController = class AppController {
    root() {
        return {
            name: 'ExactEHRM API',
            version: '1.0.0',
            description: 'Monolithic HRM backend',
            endpoints: {
                health: '/health',
                services: '/services',
                docs: '/api/docs',
                swagger: '/api',
            },
        };
    }
    health() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
    services() {
        return {
            total: 25,
            services: this.getServicesInfo(),
        };
    }
    getServicesInfo() {
        return [
            { name: 'IAM', path: '/iam', description: 'Identity & Access Management' },
            { name: 'Company', path: '/company', description: 'Companies, branches, departments' },
            { name: 'Employee', path: '/employee', description: 'Employee management' },
            { name: 'Attendance', path: '/attendance', description: 'Attendance, shifts, overtime' },
            { name: 'Leave', path: '/leave', description: 'Leave management' },
            { name: 'Payroll', path: '/payroll', description: 'Payroll processing' },
            { name: 'Performance', path: '/performance', description: 'Performance reviews' },
            { name: 'Training', path: '/training', description: 'Training programs' },
            { name: 'Onboarding', path: '/onboarding', description: 'Employee onboarding' },
            { name: 'Offboarding', path: '/offboarding', description: 'Employee offboarding' },
            { name: 'Movement', path: '/movement', description: 'Transfers & promotions' },
            { name: 'Contracts', path: '/contracts', description: 'Contract management' },
            { name: 'Assets', path: '/assets', description: 'Asset management' },
            { name: 'Benefits', path: '/benefits', description: 'Employee benefits' },
            { name: 'Disciplinary', path: '/disciplinary', description: 'Disciplinary cases' },
            { name: 'Compliance', path: '/compliance', description: 'Compliance & statutory' },
            { name: 'Announcements', path: '/announcements', description: 'Company announcements' },
            { name: 'Analytics', path: '/analytics', description: 'Analytics & dashboards' },
            { name: 'Salary Intelligence', path: '/salary-intelligence', description: 'Salary benchmarking' },
            { name: 'ExactAI', path: '/ai', description: 'AI assistant' },
            { name: 'Notifications', path: '/notifications', description: 'Notifications' },
            { name: 'Tasks', path: '/tasks', description: 'Task management' },
            { name: 'HR Query', path: '/hr-query', description: 'HR Q&A and tickets' },
            { name: 'Documents', path: '/documents', description: 'Document management' },
            { name: 'Integrations', path: '/integrations', description: 'Third-party integrations' },
        ];
    }
};
exports.AppController = AppController;
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'API root' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "root", null);
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "health", null);
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiOperation)({ summary: 'List all service modules' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "services", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('System'),
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map