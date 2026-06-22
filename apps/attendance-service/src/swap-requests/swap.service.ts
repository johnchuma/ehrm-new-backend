import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class SwapService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const swap = await this.prisma.shiftSwap.create({
      data: { ...data, date: new Date(data.date) },
    });
    return this.toResponse(swap);
  }

  async approve(id: string, status: string) {
    const swap = await this.prisma.shiftSwap.update({ where: { id }, data: { status } });
    return this.toResponse(swap);
  }

  async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    const swaps = await this.prisma.shiftSwap.findMany({ where });
    return { swaps: swaps.map((s) => this.toResponse(s)) };
  }

  private toResponse(s: any) {
    return {
      id: s.id, requesterId: s.requesterId, requesteeId: s.requesteeId,
      date: s.date?.toISOString() || '', fromShift: s.fromShift, toShift: s.toShift,
      reason: s.reason, status: s.status,
    };
  }
}
