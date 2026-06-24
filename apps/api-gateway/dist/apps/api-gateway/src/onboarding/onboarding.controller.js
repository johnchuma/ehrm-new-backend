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
exports.OnboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const onboarding_service_1 = require("../../../onboarding-service/src/onboarding/onboarding.service");
const tasks_service_1 = require("../../../onboarding-service/src/tasks/tasks.service");
let OnboardingController = class OnboardingController {
    onbService;
    taskService;
    constructor(onbService, taskService) {
        this.onbService = onbService;
        this.taskService = taskService;
    }
    create(body) { return this.onbService.create(body); }
    list(query) { return this.onbService.list(query.companyId, query.status); }
    get(id) { return this.onbService.get(id); }
    update(id, body) { return this.onbService.update(id, body); }
    advance(id, body) { return this.onbService.advanceStage(id, body.targetStage); }
    complete(id) { return this.onbService.complete(id); }
    createTask(body) { return this.taskService.create(body); }
    listTasks(onboardingId) { return this.taskService.list(onboardingId); }
    completeTask(id) { return this.taskService.complete(id); }
};
exports.OnboardingController = OnboardingController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'position', 'departmentId', 'startDate', 'hiringManagerId'],
            properties: {
                employeeId: { type: 'string', example: 'emp-010' },
                companyId: { type: 'string', example: 'comp-001' },
                position: { type: 'string', example: 'Software Engineer' },
                departmentId: { type: 'string', example: 'dept-003' },
                startDate: { type: 'string', example: '2026-07-01' },
                hiringManagerId: { type: 'string', example: 'emp-005' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OnboardingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OnboardingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnboardingController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'in_progress' },
                currentStage: { type: 'string', example: 'documentation' },
                notes: { type: 'string', example: 'Waiting for NIDA verification' },
                startDate: { type: 'string', example: '2026-07-01' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OnboardingController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/advance'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['targetStage', 'completedBy'],
            properties: {
                targetStage: { type: 'string', example: 'equipment' },
                notes: { type: 'string', example: 'IT setup completed successfully' },
                completedBy: { type: 'string', example: 'emp-005' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OnboardingController.prototype, "advance", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnboardingController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)('tasks'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['onboardingId', 'title', 'assigneeId', 'dueDate', 'category'],
            properties: {
                onboardingId: { type: 'string', example: 'onb-001' },
                title: { type: 'string', example: 'Submit academic certificates' },
                description: { type: 'string', example: 'Collect and verify copies of degree certificates' },
                assigneeId: { type: 'string', example: 'emp-010' },
                dueDate: { type: 'string', example: '2026-07-05' },
                category: { type: 'string', example: 'documentation' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OnboardingController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)('tasks/:onboardingId'),
    __param(0, (0, common_1.Param)('onboardingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnboardingController.prototype, "listTasks", null);
__decorate([
    (0, common_1.Post)('tasks/:id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnboardingController.prototype, "completeTask", null);
exports.OnboardingController = OnboardingController = __decorate([
    (0, swagger_1.ApiTags)('Onboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('onboarding'),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService,
        tasks_service_1.OnboardingTaskService])
], OnboardingController);
//# sourceMappingURL=onboarding.controller.js.map