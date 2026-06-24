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
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let DocumentService = class DocumentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadDocument(data) {
        const doc = await this.prisma.document.create({ data });
        return this.toDocResponse(doc);
    }
    async getDocument(id) {
        return this.prisma.document.findUnique({ where: { id } });
    }
    async deleteDocument(id) {
        await this.prisma.document.delete({ where: { id } });
        return { success: true, message: 'Document deleted' };
    }
    async listDocuments(employeeId) {
        const docs = await this.prisma.document.findMany({
            where: { employeeId },
            orderBy: { uploadedAt: 'desc' },
        });
        return { documents: docs.map((d) => this.toDocResponse(d)) };
    }
    toDocResponse(d) {
        return {
            id: d.id, employeeId: d.employeeId, category: d.category,
            fileName: d.fileName, fileUrl: d.fileUrl, version: d.version,
            uploadedAt: d.uploadedAt?.toISOString() || '',
        };
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], DocumentService);
//# sourceMappingURL=documents.service.js.map