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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const employees_service_1 = require("../../../employee-service/src/employees/employees.service");
const documents_service_1 = require("../../../employee-service/src/documents/documents.service");
const qualifications_service_1 = require("../../../employee-service/src/qualifications/qualifications.service");
const emergency_contacts_service_1 = require("../../../employee-service/src/emergency-contacts/emergency-contacts.service");
const family_service_1 = require("../../../employee-service/src/family/family.service");
let EmployeeController = class EmployeeController {
    empService;
    docService;
    qualService;
    ecService;
    famService;
    constructor(empService, docService, qualService, ecService, famService) {
        this.empService = empService;
        this.docService = docService;
        this.qualService = qualService;
        this.ecService = ecService;
        this.famService = famService;
    }
    create(body) { return this.empService.createEmployee(body); }
    list(query) { return this.empService.listEmployees(query.companyId, query); }
    get(id) { return this.empService.getEmployee(id); }
    getProfile(id) { return this.empService.getEmployeeProfile(id); }
    update(id, body) { return this.empService.updateEmployee(id, body); }
    remove(id) { return this.empService.deleteEmployee(id); }
    advance(id) { return this.empService.advanceApproval(id); }
    approve(id) { return this.empService.approveEmployee(id); }
    uploadDoc(body) { return this.docService.uploadDocument(body); }
    listDocs(employeeId) { return this.docService.listDocuments(employeeId); }
    addEdu(body) { return this.qualService.addEducation(body); }
    addQual(body) { return this.qualService.addProfessionalQualification(body); }
    listEdu(employeeId) { return this.qualService.listEducation(employeeId); }
    listQuals(employeeId) { return this.qualService.listQualifications(employeeId); }
    addEC(body) { return this.ecService.add(body); }
    listEC(employeeId) { return this.ecService.list(employeeId); }
    addFam(body) { return this.famService.add(body); }
    listFam(employeeId) { return this.famService.list(employeeId); }
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
    __metadata("design:paramtypes", [employees_service_1.EmployeeService,
        documents_service_1.DocumentService,
        qualifications_service_1.QualificationService,
        emergency_contacts_service_1.EmergencyContactService,
        family_service_1.FamilyService])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map