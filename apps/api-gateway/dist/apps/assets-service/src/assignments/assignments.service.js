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
exports.AssignmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let AssignmentService = class AssignmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assign(data) {
        const asset = await this.prisma.asset.findUnique({ where: { id: data.assetId } });
        const assignment = await this.prisma.assetAssignment.create({
            data: { ...data, assetName: asset?.name, assignedDate: new Date(data.assignedDate) },
        });
        await this.prisma.asset.update({ where: { id: data.assetId }, data: { status: 'Assigned', assignedTo: data.employeeId } });
        return this.toResponse(assignment);
    }
    async returnAsset(id, returnDate, condition, notes) {
        const assignment = await this.prisma.assetAssignment.update({
            where: { id },
            data: { returnDate: new Date(returnDate), status: 'Returned', condition, notes },
        });
        await this.prisma.asset.update({
            where: { id: assignment.assetId },
            data: { status: 'Available', assignedTo: null, condition },
        });
        return this.toResponse(assignment);
    }
    async list(companyId, employeeId) {
        const where = {};
        if (employeeId)
            where.employeeId = employeeId;
        const items = await this.prisma.assetAssignment.findMany({ where, orderBy: { assignedDate: 'desc' } });
        return { assignments: items.map((a) => this.toResponse(a)) };
    }
    toResponse(a) {
        return {
            id: a.id, assetId: a.assetId, assetName: a.assetName,
            employeeId: a.employeeId, employeeName: a.employeeName,
            assignedDate: a.assignedDate?.toISOString() || '',
            returnDate: a.returnDate?.toISOString() || '',
            status: a.status, condition: a.condition, notes: a.notes,
        };
    }
};
exports.AssignmentService = AssignmentService;
exports.AssignmentService = AssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], AssignmentService);
//# sourceMappingURL=assignments.service.js.map