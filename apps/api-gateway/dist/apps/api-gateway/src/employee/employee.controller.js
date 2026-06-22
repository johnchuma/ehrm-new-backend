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
exports.EmployeeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let EmployeeController = class EmployeeController {
    client;
    empService;
    docService;
    qualService;
    ecService;
    famService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.empService = this.client.getService('EmployeeService');
        this.docService = this.client.getService('DocumentService');
        this.qualService = this.client.getService('QualificationService');
        this.ecService = this.client.getService('EmergencyContactService');
        this.famService = this.client.getService('FamilyService');
    }
    create(body) { return (0, rxjs_1.firstValueFrom)(this.empService.CreateEmployee(body)); }
    list(query) { return (0, rxjs_1.firstValueFrom)(this.empService.ListEmployees(query)); }
    get(id) { return (0, rxjs_1.firstValueFrom)(this.empService.GetEmployee({ id })); }
    getProfile(id) { return (0, rxjs_1.firstValueFrom)(this.empService.GetEmployeeProfile({ id })); }
    update(id, body) { return (0, rxjs_1.firstValueFrom)(this.empService.UpdateEmployee({ id, ...body })); }
    remove(id) { return (0, rxjs_1.firstValueFrom)(this.empService.DeleteEmployee({ id })); }
    advance(id) { return (0, rxjs_1.firstValueFrom)(this.empService.AdvanceApproval({ id })); }
    approve(id) { return (0, rxjs_1.firstValueFrom)(this.empService.ApproveEmployee({ id })); }
    uploadDoc(body) { return (0, rxjs_1.firstValueFrom)(this.docService.UploadDocument(body)); }
    listDocs(employeeId) { return (0, rxjs_1.firstValueFrom)(this.docService.ListDocuments({ employeeId })); }
    addEdu(body) { return (0, rxjs_1.firstValueFrom)(this.qualService.AddEducation(body)); }
    addQual(body) { return (0, rxjs_1.firstValueFrom)(this.qualService.AddProfessionalQualification(body)); }
    listEdu(employeeId) { return (0, rxjs_1.firstValueFrom)(this.qualService.ListEducation({ employeeId })); }
    listQuals(employeeId) { return (0, rxjs_1.firstValueFrom)(this.qualService.ListQualifications({ employeeId })); }
    addEC(body) { return (0, rxjs_1.firstValueFrom)(this.ecService.AddEmergencyContact(body)); }
    listEC(employeeId) { return (0, rxjs_1.firstValueFrom)(this.ecService.ListEmergencyContacts({ employeeId })); }
    addFam(body) { return (0, rxjs_1.firstValueFrom)(this.famService.AddFamilyMember(body)); }
    listFam(employeeId) { return (0, rxjs_1.firstValueFrom)(this.famService.ListFamily({ employeeId })); }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create employee' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth', 'hireDate', 'departmentId', 'position', 'salary'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Mwangi' },
                email: { type: 'string', example: 'john.mwangi@example.co.tz' },
                phone: { type: 'string', example: '+255712345678' },
                gender: { type: 'string', example: 'Male' },
                dateOfBirth: { type: 'string', example: '1990-05-15' },
                hireDate: { type: 'string', example: '2024-01-10' },
                departmentId: { type: 'string', example: 'dept-001' },
                position: { type: 'string', example: 'Software Engineer' },
                salary: { type: 'number', example: 1500000 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Mwangi' },
                email: { type: 'string', example: 'john.mwangi@example.co.tz' },
                phone: { type: 'string', example: '+255712345678' },
                departmentId: { type: 'string', example: 'dept-002' },
                position: { type: 'string', example: 'Senior Software Engineer' },
                salary: { type: 'number', example: 2000000 },
                status: { type: 'string', example: 'active' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/advance-approval'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "advance", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('documents'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'title', 'type', 'fileUrl'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                title: { type: 'string', example: 'National ID' },
                type: { type: 'string', example: 'identification' },
                fileUrl: { type: 'string', example: 'https://storage.example.co.tz/documents/id-001.pdf' },
                expiryDate: { type: 'string', example: '2030-12-31' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "uploadDoc", null);
__decorate([
    (0, common_1.Get)('documents/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "listDocs", null);
__decorate([
    (0, common_1.Post)('qualifications/education'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'institution', 'degree', 'fieldOfStudy', 'startDate'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                institution: { type: 'string', example: 'University of Dar es Salaam' },
                degree: { type: 'string', example: 'Bachelor of Science' },
                fieldOfStudy: { type: 'string', example: 'Computer Science' },
                startDate: { type: 'string', example: '2012-09-01' },
                endDate: { type: 'string', example: '2016-06-30' },
                grade: { type: 'string', example: 'First Class Honours' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "addEdu", null);
__decorate([
    (0, common_1.Post)('qualifications/professional'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'name', 'issuingBody', 'issueDate', 'licenseNumber'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                name: { type: 'string', example: 'AWS Certified Solutions Architect' },
                issuingBody: { type: 'string', example: 'Amazon Web Services' },
                issueDate: { type: 'string', example: '2023-03-15' },
                expiryDate: { type: 'string', example: '2026-03-15' },
                licenseNumber: { type: 'string', example: 'AWS-SA-2023-001234' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "addQual", null);
__decorate([
    (0, common_1.Get)('qualifications/education/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "listEdu", null);
__decorate([
    (0, common_1.Get)('qualifications/professional/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "listQuals", null);
__decorate([
    (0, common_1.Post)('emergency-contacts'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'name', 'relationship', 'phone'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                name: { type: 'string', example: 'Amina Mwangi' },
                relationship: { type: 'string', example: 'Spouse' },
                phone: { type: 'string', example: '+255787654321' },
                email: { type: 'string', example: 'amina.mwangi@example.co.tz' },
                address: { type: 'string', example: '123 Mtaa wa Uhuru, Dar es Salaam' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "addEC", null);
__decorate([
    (0, common_1.Get)('emergency-contacts/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "listEC", null);
__decorate([
    (0, common_1.Post)('family'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'name', 'relationship', 'dateOfBirth'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                name: { type: 'string', example: 'Amina Mwangi' },
                relationship: { type: 'string', example: 'Spouse' },
                dateOfBirth: { type: 'string', example: '1992-08-20' },
                occupation: { type: 'string', example: 'Nurse' },
                phone: { type: 'string', example: '+255787654321' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "addFam", null);
__decorate([
    (0, common_1.Get)('family/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "listFam", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, swagger_1.ApiTags)('Employee'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('employee'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.EMPLOYEE)),
    __metadata("design:paramtypes", [Object])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map