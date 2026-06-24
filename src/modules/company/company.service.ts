import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return { id: 'new', ...data };
  }

  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return null;
  }
}
