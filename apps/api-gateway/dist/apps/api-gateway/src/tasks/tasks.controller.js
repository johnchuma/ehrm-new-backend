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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tasks_service_1 = require("../../../tasks-service/src/tasks/tasks.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TasksController = class TasksController {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    create(body) { return this.taskService.create(body); }
    list(query) { return this.taskService.list(query.companyId, query); }
    get(id) { return this.taskService.get(id); }
    update(id, body) { return this.taskService.update(id, body); }
    remove(id) { return this.taskService.delete(id); }
    assign(id, body) { return this.taskService.assign(id, body.assigneeId); }
    complete(id) { return this.taskService.complete(id); }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['title', 'companyId'],
            properties: {
                title: { type: 'string', example: 'Complete monthly safety inspection report' },
                description: { type: 'string', example: 'Conduct and file the safety inspection for Dar es Salaam warehouse' },
                assignedTo: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'high' },
                dueDate: { type: 'string', example: '2026-07-15' },
                category: { type: 'string', example: 'safety' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Complete monthly safety inspection report' },
                description: { type: 'string', example: 'Updated scope: include electrical systems check' },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'urgent' },
                dueDate: { type: 'string', example: '2026-06-30' },
                status: { type: 'string', enum: ['pending', 'in_progress', 'completed'], example: 'in_progress' },
                progress: { type: 'number', example: 45 },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['assigneeId', 'assignedBy'],
            properties: {
                assigneeId: { type: 'string', example: 'emp-002' },
                assignedBy: { type: 'string', example: 'emp-001' },
                notes: { type: 'string', example: 'Please complete this before end of week' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "complete", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('Tasks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TaskService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map