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
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AssetsController = class AssetsController {
    client;
    assetService;
    assignService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.assetService = this.client.getService('AssetService');
        this.assignService = this.client.getService('AssetAssignmentService');
    }
    create(body) { return (0, rxjs_1.firstValueFrom)(this.assetService.CreateAsset(body)); }
    list(query) { return (0, rxjs_1.firstValueFrom)(this.assetService.ListAssets(query)); }
    get(id) { return (0, rxjs_1.firstValueFrom)(this.assetService.GetAsset({ id })); }
    update(id, body) { return (0, rxjs_1.firstValueFrom)(this.assetService.UpdateAsset({ id, ...body })); }
    remove(id) { return (0, rxjs_1.firstValueFrom)(this.assetService.DeleteAsset({ id })); }
    assign(body) { return (0, rxjs_1.firstValueFrom)(this.assignService.AssignAsset(body)); }
    return(id, body) { return (0, rxjs_1.firstValueFrom)(this.assignService.ReturnAsset({ id, ...body })); }
    listAssign(query) { return (0, rxjs_1.firstValueFrom)(this.assignService.ListAssignments(query)); }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'category'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                name: { type: 'string', example: 'Dell Latitude 5540 Laptop' },
                description: { type: 'string', example: '15-inch laptop for finance department use' },
                serialNumber: { type: 'string', example: 'DL-5540-TZ-0012' },
                category: { type: 'string', example: 'it_equipment' },
                purchaseDate: { type: 'string', example: '2026-01-15' },
                purchaseValue: { type: 'number', example: 2500000 },
                location: { type: 'string', example: 'Dar es Salaam Office - Floor 3' },
                status: { type: 'string', enum: ['available', 'assigned', 'maintenance', 'retired'], example: 'available' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Dell Latitude 5540 Laptop' },
                description: { type: 'string', example: 'Updated: 15-inch laptop with docking station' },
                location: { type: 'string', example: 'Dar es Salaam Office - Floor 2' },
                status: { type: 'string', enum: ['available', 'assigned', 'maintenance', 'retired'], example: 'maintenance' },
                condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'], example: 'good' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('assign'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['assetId', 'employeeId', 'companyId'],
            properties: {
                assetId: { type: 'string', example: 'asset-001' },
                employeeId: { type: 'string', example: 'emp-003' },
                companyId: { type: 'string', example: 'comp-001' },
                assignedDate: { type: 'string', example: '2026-06-22' },
                expectedReturnDate: { type: 'string', example: '2026-12-31' },
                notes: { type: 'string', example: 'Assigned for project X - handle with care' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('return/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['condition', 'returnedBy'],
            properties: {
                condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'], example: 'good' },
                notes: { type: 'string', example: 'Laptop returned in good condition, minor scratch on lid' },
                returnedBy: { type: 'string', example: 'emp-003' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "return", null);
__decorate([
    (0, common_1.Get)('assignments'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "listAssign", null);
exports.AssetsController = AssetsController = __decorate([
    (0, swagger_1.ApiTags)('Assets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('assets'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.ASSETS)),
    __metadata("design:paramtypes", [Object])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map