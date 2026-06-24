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
exports.EmergencyContactService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let EmergencyContactService = class EmergencyContactService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async add(data) {
        const contact = await this.prisma.emergencyContact.create({ data });
        return this.toResponse(contact);
    }
    async list(employeeId) {
        const contacts = await this.prisma.emergencyContact.findMany({ where: { employeeId } });
        return { contacts: contacts.map((c) => this.toResponse(c)) };
    }
    toResponse(c) {
        return {
            id: c.id, employeeId: c.employeeId, name: c.name,
            relationship: c.relationship, phone: c.phone, altPhone: c.altPhone,
        };
    }
};
exports.EmergencyContactService = EmergencyContactService;
exports.EmergencyContactService = EmergencyContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], EmergencyContactService);
//# sourceMappingURL=emergency-contacts.service.js.map