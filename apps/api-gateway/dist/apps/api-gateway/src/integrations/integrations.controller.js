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
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const integrations_service_1 = require("../../../integrations-service/src/integrations/integrations.service");
const webhooks_service_1 = require("../../../integrations-service/src/webhooks/webhooks.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let IntegrationsController = class IntegrationsController {
    integrationService;
    webhookService;
    constructor(integrationService, webhookService) {
        this.integrationService = integrationService;
        this.webhookService = webhookService;
    }
    create(body) { return this.integrationService.create(body); }
    list(query) { return this.integrationService.list(query.companyId, query.type); }
    update(id, body) { return this.integrationService.update(id, body); }
    remove(id) { return this.integrationService.delete(id); }
    toggle(id, body) { return this.integrationService.toggle(id, body.isActive); }
    createWh(body) { return this.webhookService.create(body); }
    listWh(query) { return this.webhookService.list(query.companyId); }
    removeWh(id) { return this.webhookService.delete(id); }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'type', 'provider', 'config', 'credentials'],
            properties: {
                companyId: { type: 'string', example: 'comp_tz_001' },
                name: { type: 'string', example: 'Tigo Pesa Payment Gateway' },
                type: { type: 'string', example: 'Payment' },
                provider: { type: 'string', example: 'Tigo Pesa' },
                config: {
                    type: 'object',
                    example: { baseUrl: 'https://api.tigopesa.co.tz', environment: 'production', timeout: 30000 },
                },
                credentials: {
                    type: 'object',
                    example: { apiKey: 'tp_live_abc123', merchantId: 'M12345678' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "list", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Tigo Pesa Payment Gateway v2' },
                config: {
                    type: 'object',
                    example: { baseUrl: 'https://api.tigopesa.co.tz/v2', environment: 'production', timeout: 45000 },
                },
                credentials: {
                    type: 'object',
                    example: { apiKey: 'tp_live_xyz789', merchantId: 'M12345678' },
                },
                isActive: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/toggle'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['isActive', 'updatedBy'],
            properties: {
                isActive: { type: 'boolean', example: false },
                updatedBy: { type: 'string', example: 'emp_005' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "toggle", null);
__decorate([
    (0, common_1.Post)('webhooks'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'url', 'events'],
            properties: {
                companyId: { type: 'string', example: 'comp_tz_001' },
                name: { type: 'string', example: 'Employee Payroll Notification' },
                url: { type: 'string', example: 'https://erp.company.co.tz/webhooks/payroll' },
                events: { type: 'array', items: { type: 'string' }, example: ['employee.created', 'payroll.processed'] },
                secret: { type: 'string', example: 'whsec_tz_abc123xyz' },
                isActive: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "createWh", null);
__decorate([
    (0, common_1.Get)('webhooks'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "listWh", null);
__decorate([
    (0, common_1.Delete)('webhooks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "removeWh", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, swagger_1.ApiTags)('Integrations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('integrations'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationService,
        webhooks_service_1.WebhookService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map