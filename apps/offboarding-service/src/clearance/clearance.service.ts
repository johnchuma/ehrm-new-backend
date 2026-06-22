import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class ClearanceService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const c = await this.prisma.clearance.create({ data });
    return this.toResponse(c);
  }

  async approve(id: string, status: string, notes?: string) {
    const c = await this.prisma.clearance.update({ where: { id }, data: { status, notes } });
    return this.toResponse(c);
  }

  async list(offboardingId: string) {
    const items = await this.prisma.clearance.findMany({ where: { offboardingId } });
    return { clearances: items.map((c) => this.toResponse(c)) };
  }

  private toResponse(c: any) {
    return {
      id: c.id, offboardingId: c.offboardingId, department: c.department,
      items: c.items, status: c.status, notes: c.notes,
      createdAt: c.createdAt?.toISOString() || '',
    };
  }
}
