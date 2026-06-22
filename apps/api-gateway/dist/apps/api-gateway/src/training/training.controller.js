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
exports.TrainingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TrainingController = class TrainingController {
    client;
    progService;
    enrService;
    certService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.progService = this.client.getService('ProgramService');
        this.enrService = this.client.getService('EnrollmentService');
        this.certService = this.client.getService('CertificationService');
    }
    createProg(body) { return (0, rxjs_1.firstValueFrom)(this.progService.CreateProgram(body)); }
    listProgs(query) { return (0, rxjs_1.firstValueFrom)(this.progService.ListPrograms(query)); }
    getProg(id) { return (0, rxjs_1.firstValueFrom)(this.progService.GetProgram({ id })); }
    updateProg(id, body) { return (0, rxjs_1.firstValueFrom)(this.progService.UpdateProgram({ id, ...body })); }
    deleteProg(id) { return (0, rxjs_1.firstValueFrom)(this.progService.DeleteProgram({ id })); }
    enroll(body) { return (0, rxjs_1.firstValueFrom)(this.enrService.EnrollEmployee(body)); }
    listEnr(query) { return (0, rxjs_1.firstValueFrom)(this.enrService.ListEnrollments(query)); }
    updateEnr(id, body) { return (0, rxjs_1.firstValueFrom)(this.enrService.UpdateEnrollment({ id, ...body })); }
    issueCert(body) { return (0, rxjs_1.firstValueFrom)(this.certService.IssueCertification(body)); }
    listCerts(query) { return (0, rxjs_1.firstValueFrom)(this.certService.ListCertifications(query)); }
};
exports.TrainingController = TrainingController;
__decorate([
    (0, common_1.Post)('programs'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'title', 'category', 'startDate', 'endDate'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                title: { type: 'string', example: 'Leadership Development Program' },
                description: { type: 'string', example: 'Advanced leadership skills for mid-level managers' },
                category: { type: 'string', example: 'leadership' },
                startDate: { type: 'string', example: '2026-07-01' },
                endDate: { type: 'string', example: '2026-09-30' },
                maxParticipants: { type: 'number', example: 20 },
                instructor: { type: 'string', example: 'Dr. Amina Mwalimu' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "createProg", null);
__decorate([
    (0, common_1.Get)('programs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "listProgs", null);
__decorate([
    (0, common_1.Get)('programs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "getProg", null);
__decorate([
    (0, common_1.Put)('programs/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Leadership Development Program' },
                description: { type: 'string', example: 'Updated curriculum for modern leadership' },
                startDate: { type: 'string', example: '2026-07-15' },
                endDate: { type: 'string', example: '2026-10-15' },
                maxParticipants: { type: 'number', example: 25 },
                status: { type: 'string', example: 'active' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "updateProg", null);
__decorate([
    (0, common_1.Delete)('programs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "deleteProg", null);
__decorate([
    (0, common_1.Post)('enrollments'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['programId', 'employeeId', 'companyId'],
            properties: {
                programId: { type: 'string', example: 'prog-001' },
                employeeId: { type: 'string', example: 'emp-003' },
                companyId: { type: 'string', example: 'comp-001' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)('enrollments'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "listEnr", null);
__decorate([
    (0, common_1.Put)('enrollments/:id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'completed' },
                completionDate: { type: 'string', example: '2026-09-28' },
                score: { type: 'number', example: 87 },
                certificateUrl: { type: 'string', example: 'https://certs.example.com/cert-001.pdf' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "updateEnr", null);
__decorate([
    (0, common_1.Post)('certifications'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'programId', 'name', 'issuingBody', 'issueDate'],
            properties: {
                employeeId: { type: 'string', example: 'emp-003' },
                programId: { type: 'string', example: 'prog-001' },
                name: { type: 'string', example: 'Certified Leadership Professional' },
                issuingBody: { type: 'string', example: ' Tanzania Institute of Management' },
                issueDate: { type: 'string', example: '2026-09-30' },
                expiryDate: { type: 'string', example: '2029-09-30' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "issueCert", null);
__decorate([
    (0, common_1.Get)('certifications'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "listCerts", null);
exports.TrainingController = TrainingController = __decorate([
    (0, swagger_1.ApiTags)('Training'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('training'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.TRAINING)),
    __metadata("design:paramtypes", [Object])
], TrainingController);
//# sourceMappingURL=training.controller.js.map