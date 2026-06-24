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
exports.ExactAIController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("../../../exactai-service/src/ai/ai.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ExactAIController = class ExactAIController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    chat(body) { return this.aiService.chat(body); }
    summarize(employeeId) { return this.aiService.summarizeEmployee(employeeId); }
    insights(query) { return this.aiService.getInsights(query.companyId, query.type); }
    predict(query) { return this.aiService.predictAttrition(query.companyId, query.departmentId); }
    recommend(body) { return this.aiService.recommendActions(body.companyId, body.scenario); }
};
exports.ExactAIController = ExactAIController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['message', 'employeeId', 'companyId'],
            properties: {
                message: { type: 'string', example: 'What are the performance metrics for my team this quarter?' },
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-tz-001' },
                context: { type: 'string', example: 'Team lead reviewing Q2 performance data' },
                conversationId: { type: 'string', example: 'conv-abc-123' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExactAIController.prototype, "chat", null);
__decorate([
    (0, common_1.Get)('summarize/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExactAIController.prototype, "summarize", null);
__decorate([
    (0, common_1.Get)('insights'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExactAIController.prototype, "insights", null);
__decorate([
    (0, common_1.Get)('attrition'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExactAIController.prototype, "predict", null);
__decorate([
    (0, common_1.Post)('recommend'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'scenario'],
            properties: {
                employeeId: { type: 'string', example: 'emp-045' },
                companyId: { type: 'string', example: 'comp-tz-001' },
                scenario: { type: 'string', example: 'High-potential engineer at risk of attrition due to below-market compensation' },
                context: { type: 'string', example: 'Employee has received an external offer at 40% higher salary. Budget available for retention adjustment.' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExactAIController.prototype, "recommend", null);
exports.ExactAIController = ExactAIController = __decorate([
    (0, swagger_1.ApiTags)('ExactAI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AIService])
], ExactAIController);
//# sourceMappingURL=exactai.controller.js.map