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
exports.HRQueryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let HRQueryService = class HRQueryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async askQuestion(data) {
        const faqs = await this.prisma.fAQ.findMany({ where: { companyId: data.companyId } });
        const matched = faqs.filter((f) => f.question.toLowerCase().includes(data.question.toLowerCase()) ||
            f.answer.toLowerCase().includes(data.question.toLowerCase()) ||
            (data.category && f.category === data.category)).slice(0, 3);
        return {
            answer: matched[0]?.answer || 'I could not find a specific answer. Please create a support ticket and our HR team will assist you.',
            confidence: matched.length > 0 ? 'high' : 'low',
            relatedQuestions: faqs.slice(0, 5).map((f) => f.question),
            relatedFAQs: matched.map((f) => ({
                id: f.id, question: f.question, answer: f.answer,
                category: f.category, views: f.views, helpfulness: f.helpfulness,
            })),
        };
    }
    async getFAQs(companyId, category) {
        const where = { companyId };
        if (category)
            where.category = category;
        const faqs = await this.prisma.fAQ.findMany({ where });
        return { faqs: faqs.map((f) => this.toFaqResponse(f)) };
    }
    async createFAQ(data) {
        const f = await this.prisma.fAQ.create({ data });
        return this.toFaqResponse(f);
    }
    toFaqResponse(f) {
        return {
            id: f.id, question: f.question, answer: f.answer,
            category: f.category, views: f.views, helpfulness: f.helpfulness,
            createdAt: f.createdAt?.toISOString() || '',
        };
    }
};
exports.HRQueryService = HRQueryService;
exports.HRQueryService = HRQueryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], HRQueryService);
//# sourceMappingURL=hr-query.service.js.map