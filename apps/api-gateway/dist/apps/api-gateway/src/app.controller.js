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
const grpc_module_1 = require("../../../libs/common/src/grpc/grpc.module");
let AppController = class AppController {
    root() {
        return {
            name: 'ExactEHRM API Gateway',
            version: '1.0.0',
            description: 'Microservices-based HRM backend with gRPC inter-service communication',
            services: this.getServicesInfo(),
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
            total: Object.keys(grpc_module_1.SERVICE_PORTS).length,
            services: this.getServicesInfo(),
        };
    }
    getServicesInfo() {
        return [
            { name: 'IAM', port: 5001, path: '/iam', description: 'Identity & Access Management' },
            { name: 'Company', port: 5002, path: '/company', description: 'Companies, branches, departments' },
            { name: 'Employee', port: 5003, path: '/employee', description: 'Employee management' },
            { name: 'Attendance', port: 5004, path: '/attendance', description: 'Attendance, shifts, overtime' },
            { name: 'Leave', port: 5005, path: '/leave', description: 'Leave management' },
            { name: 'Payroll', port: 5006, path: '/payroll', description: 'Payroll processing' },
            { name: 'Performance', port: 5007, path: '/performance', description: 'Performance reviews' },
            { name: 'Training', port: 5008, path: '/training', description: 'Training programs' },
            { name: 'Onboarding', port: 5009, path: '/onboarding', description: 'Employee onboarding' },
            { name: 'Offboarding', port: 5010, path: '/offboarding', description: 'Employee offboarding' },
            { name: 'Movement', port: 5011, path: '/movement', description: 'Transfers & promotions' },
            { name: 'Contracts', port: 5012, path: '/contracts', description: 'Contract management' },
            { name: 'Assets', port: 5013, path: '/assets', description: 'Asset management' },
            { name: 'Benefits', port: 5014, path: '/benefits', description: 'Employee benefits' },
            { name: 'Disciplinary', port: 5015, path: '/disciplinary', description: 'Disciplinary cases' },
            { name: 'Compliance', port: 5016, path: '/compliance', description: 'Compliance & statutory' },
            { name: 'Announcements', port: 5017, path: '/announcements', description: 'Company announcements' },
            { name: 'Analytics', port: 5018, path: '/analytics', description: 'Analytics & dashboards' },
            { name: 'Salary Intelligence', port: 5019, path: '/salary-intelligence', description: 'Salary benchmarking' },
            { name: 'ExactAI', port: 5020, path: '/ai', description: 'AI assistant' },
            { name: 'Notifications', port: 5021, path: '/notifications', description: 'Notifications' },
            { name: 'Tasks', port: 5022, path: '/tasks', description: 'Task management' },
            { name: 'HR Query', port: 5023, path: '/hr-query', description: 'HR Q&A and tickets' },
            { name: 'Documents', port: 5024, path: '/documents', description: 'Document management' },
            { name: 'Integrations', port: 5025, path: '/integrations', description: 'Third-party integrations' },
        ];
    }
};
exports.AppController = AppController;
__decorate([
    (0, index_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'API Gateway root' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'List all microservices' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "services", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('System'),
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map