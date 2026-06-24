import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; email: string; phone?: string; country?: string; currency?: string; subscriptionPlan?: string }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return this.prisma.user.findMany(); // placeholder - no Company model in current schema
  }

  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return null;
  }
}
