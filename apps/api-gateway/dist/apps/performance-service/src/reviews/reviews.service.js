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
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let ReviewService = class ReviewService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const r = await this.prisma.review.create({ data });
        return this.toResponse(r);
    }
    async get(id) {
        const r = await this.prisma.review.findUnique({ where: { id } });
        if (!r)
            throw decorators_1.GrpcErrors.NOT_FOUND('Review not found');
        return this.toResponse(r);
    }
    async update(id, data) {
        const r = await this.prisma.review.update({ where: { id }, data });
        return this.toResponse(r);
    }
    async submit(id) {
        const r = await this.prisma.review.update({
            where: { id },
            data: { status: 'Submitted', submittedAt: new Date() },
        });
        return this.toResponse(r);
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.employeeId)
            where.employeeId = filters.employeeId;
        if (filters.status)
            where.status = filters.status;
        const reviews = await this.prisma.review.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { reviews: reviews.map((r) => this.toResponse(r)) };
    }
    toResponse(r) {
        return {
            id: r.id, companyId: r.companyId, employeeId: r.employeeId,
            employeeName: r.employeeName, reviewerId: r.reviewerId, reviewerName: r.reviewerName,
            period: r.period, type: r.type, rating: r.rating,
            strengths: r.strengths, improvements: r.improvements, comments: r.comments,
            status: r.status, createdAt: r.createdAt?.toISOString() || '',
            submittedAt: r.submittedAt?.toISOString() || '',
        };
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], ReviewService);
//# sourceMappingURL=reviews.service.js.map