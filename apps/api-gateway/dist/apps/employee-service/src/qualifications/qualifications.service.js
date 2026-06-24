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
exports.QualificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let QualificationService = class QualificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addEducation(data) {
        const edu = await this.prisma.education.create({ data });
        return {
            id: edu.id, employeeId: edu.employeeId, institution: edu.institution,
            qualification: edu.qualification, award: edu.award, year: edu.year,
        };
    }
    async addProfessionalQualification(data) {
        const qual = await this.prisma.qualification.create({
            data: { ...data, expiry: data.expiry ? new Date(data.expiry) : null },
        });
        return {
            id: qual.id, employeeId: qual.employeeId, name: qual.name,
            authority: qual.authority, licenseNumber: qual.licenseNumber,
            expiry: qual.expiry?.toISOString() || '',
        };
    }
    async listEducation(employeeId) {
        const edus = await this.prisma.education.findMany({ where: { employeeId } });
        return { education: edus.map((e) => ({ id: e.id, employeeId: e.employeeId, institution: e.institution, qualification: e.qualification, award: e.award, year: e.year })) };
    }
    async listQualifications(employeeId) {
        const quals = await this.prisma.qualification.findMany({ where: { employeeId } });
        return { qualifications: quals.map((q) => ({ id: q.id, employeeId: q.employeeId, name: q.name, authority: q.authority, licenseNumber: q.licenseNumber, expiry: q.expiry?.toISOString() || '' })) };
    }
};
exports.QualificationService = QualificationService;
exports.QualificationService = QualificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], QualificationService);
//# sourceMappingURL=qualifications.service.js.map