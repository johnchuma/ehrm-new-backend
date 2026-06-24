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
exports.CertificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let CertificationService = class CertificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async issue(data) {
        const program = await this.prisma.trainingProgram.findUnique({ where: { id: data.programId } });
        const cert = await this.prisma.certification.create({
            data: {
                ...data,
                programTitle: program?.title,
                issuedDate: new Date(data.issuedDate),
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
            },
        });
        return this.toResponse(cert);
    }
    async list(employeeId, companyId) {
        const where = {};
        if (employeeId)
            where.employeeId = employeeId;
        const certs = await this.prisma.certification.findMany({ where, orderBy: { issuedDate: 'desc' } });
        return { certifications: certs.map((c) => this.toResponse(c)) };
    }
    toResponse(c) {
        return {
            id: c.id, employeeId: c.employeeId, employeeName: c.employeeName,
            programId: c.programId, programTitle: c.programTitle,
            certificateNumber: c.certificateNumber,
            issuedDate: c.issuedDate?.toISOString() || '',
            expiryDate: c.expiryDate?.toISOString() || '',
        };
    }
};
exports.CertificationService = CertificationService;
exports.CertificationService = CertificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], CertificationService);
//# sourceMappingURL=certifications.service.js.map