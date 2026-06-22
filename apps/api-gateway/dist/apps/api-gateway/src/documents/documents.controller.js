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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let DocumentsController = class DocumentsController {
    client;
    service;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() { this.service = this.client.getService('DocumentService'); }
    upload(body) { return (0, rxjs_1.firstValueFrom)(this.service.UploadDocument(body)); }
    list(query) { return (0, rxjs_1.firstValueFrom)(this.service.ListDocuments(query)); }
    get(id) { return (0, rxjs_1.firstValueFrom)(this.service.GetDocument({ id })); }
    update(id, body) { return (0, rxjs_1.firstValueFrom)(this.service.UpdateDocument({ id, ...body })); }
    remove(id) { return (0, rxjs_1.firstValueFrom)(this.service.DeleteDocument({ id })); }
    share(id, body) { return (0, rxjs_1.firstValueFrom)(this.service.ShareDocument({ id, ...body })); }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'title', 'type', 'fileUrl', 'mimeType'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                title: { type: 'string', example: 'National ID Copy' },
                description: { type: 'string', example: 'Scanned copy of national identity card' },
                type: { type: 'string', example: 'identification' },
                fileUrl: { type: 'string', example: 'https://storage.example.com/documents/emp-001/national-id.pdf' },
                fileSize: { type: 'number', example: 2048576 },
                mimeType: { type: 'string', example: 'application/pdf' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Updated National ID Copy' },
                description: { type: 'string', example: 'Re-uploaded clearer scan of national identity card' },
                type: { type: 'string', example: 'identification' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['sharedWith', 'permission'],
            properties: {
                sharedWith: { type: 'string', example: 'hr-director-001' },
                permission: { type: 'string', example: 'read-only' },
                expiresAt: { type: 'string', example: '2026-06-30' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "share", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Documents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('documents'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.DOCUMENTS)),
    __metadata("design:paramtypes", [Object])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map