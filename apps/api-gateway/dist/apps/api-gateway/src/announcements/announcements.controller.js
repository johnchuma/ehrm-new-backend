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
exports.AnnouncementsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const announcements_service_1 = require("../../../announcements-service/src/announcements/announcements.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AnnouncementsController = class AnnouncementsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(body) { return this.service.create(body); }
    list(query) { return this.service.list(query.companyId, query); }
    get(id) { return this.service.get(id); }
    update(id, body) { return this.service.update(id, body); }
    remove(id) { return this.service.delete(id); }
};
exports.AnnouncementsController = AnnouncementsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'title', 'content', 'authorId'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                title: { type: 'string', example: 'Office Closure During Eid festivities' },
                content: { type: 'string', example: 'The office will be closed from April 10-12 in observance of Eid El Fitr. Please plan accordingly.' },
                authorId: { type: 'string', example: 'emp-001' },
                priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
                targetAudience: { type: 'string', enum: ['all', 'hr', 'finance', 'operations'], example: 'all' },
                expiresAt: { type: 'string', example: '2026-04-12T23:59:59Z' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Updated: Office Closure During Eid festivities' },
                content: { type: 'string', example: 'The office will now close from April 9-12. Emergency contacts available on-call.' },
                priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
                targetAudience: { type: 'string', enum: ['all', 'hr', 'finance', 'operations'], example: 'all' },
                expiresAt: { type: 'string', example: '2026-04-12T23:59:59Z' },
                isActive: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "remove", null);
exports.AnnouncementsController = AnnouncementsController = __decorate([
    (0, swagger_1.ApiTags)('Announcements'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('announcements'),
    __metadata("design:paramtypes", [announcements_service_1.AnnouncementService])
], AnnouncementsController);
//# sourceMappingURL=announcements.controller.js.map