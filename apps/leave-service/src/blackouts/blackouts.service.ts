import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class BlackoutService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const bp = await this.prisma.blackoutPeriod.create({
      data: { ...data, from: new Date(data.from), to: new Date(data.to) },
    });
    return this.toResponse(bp);
  }

  async list(companyId: string) {
    const bps = await this.prisma.blackoutPeriod.findMany({ where: { companyId } });
    return { blackouts: bps.map((b) => this.toResponse(b)) };
  }

  private toResponse(b: any) {
    return {
      id: b.id, companyId: b.companyId, name: b.name,
      from: b.from?.toISOString() || '', to: b.to?.toISOString() || '',
      scope: b.scope, status: b.status, description: b.description,
    };
  }
}
