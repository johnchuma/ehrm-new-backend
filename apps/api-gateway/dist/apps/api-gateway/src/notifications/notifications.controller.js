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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let NotificationsController = class NotificationsController {
    client;
    service;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() { this.service = this.client.getService('NotificationService'); }
    create(body) { return (0, rxjs_1.firstValueFrom)(this.service.CreateNotification(body)); }
    list(query) { return (0, rxjs_1.firstValueFrom)(this.service.ListNotifications(query)); }
    get(id) { return (0, rxjs_1.firstValueFrom)(this.service.GetNotification({ id })); }
    markRead(id) { return (0, rxjs_1.firstValueFrom)(this.service.MarkAsRead({ id })); }
    markAll(body) { return (0, rxjs_1.firstValueFrom)(this.service.MarkAllAsRead(body)); }
    remove(id) { return (0, rxjs_1.firstValueFrom)(this.service.DeleteNotification({ id })); }
    unread(userId) { return (0, rxjs_1.firstValueFrom)(this.service.GetUnreadCount({ userId })); }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['userId', 'companyId', 'title', 'message'],
            properties: {
                userId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                title: { type: 'string', example: 'Leave request approved' },
                message: { type: 'string', example: 'Your annual leave request for July has been approved by the manager.' },
                type: { type: 'string', example: 'info' },
                priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
                channels: { type: 'array', items: { type: 'string' }, example: ['in_app', 'email'] },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('read-all'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['userId', 'companyId'],
            properties: {
                userId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                notificationIds: { type: 'array', items: { type: 'string' }, example: ['notif-001', 'notif-002', 'notif-003'] },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('unread/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "unread", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('notifications'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.NOTIFICATIONS)),
    __metadata("design:paramtypes", [Object])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map