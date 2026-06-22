import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class HRQueryService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async askQuestion(data: { companyId: string; userId: string; question: string; category?: string }) {
    const faqs = await this.prisma.fAQ.findMany({ where: { companyId: data.companyId } });
    const matched = faqs.filter((f) =>
      f.question.toLowerCase().includes(data.question.toLowerCase()) ||
      f.answer.toLowerCase().includes(data.question.toLowerCase()) ||
      (data.category && f.category === data.category)
    ).slice(0, 3);

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

  async getFAQs(companyId: string, category?: string) {
    const where: any = { companyId };
    if (category) where.category = category;
    const faqs = await this.prisma.fAQ.findMany({ where });
    return { faqs: faqs.map((f) => this.toFaqResponse(f)) };
  }

  async createFAQ(data: any) {
    const f = await this.prisma.fAQ.create({ data });
    return this.toFaqResponse(f);
  }

  private toFaqResponse(f: any) {
    return {
      id: f.id, question: f.question, answer: f.answer,
      category: f.category, views: f.views, helpfulness: f.helpfulness,
      createdAt: f.createdAt?.toISOString() || '',
    };
  }
}
