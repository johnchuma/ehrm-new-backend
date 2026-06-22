import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class ActionService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const a = await this.prisma.disciplinaryAction.create({
      data: { ...data, effectiveDate: new Date(data.effectiveDate) },
    });
    return this.toResponse(a);
  }

  async approve(id: string, status: string) {
    const a = await this.prisma.disciplinaryAction.update({ where: { id }, data: { status } });
    return this.toResponse(a);
  }

  async list(caseId: string) {
    const items = await this.prisma.disciplinaryAction.findMany({ where: { caseId } });
    return { actions: items.map((a) => this.toResponse(a)) };
  }

  private toResponse(a: any) {
    return {
      id: a.id, caseId: a.caseId, type: a.type, description: a.description,
      effectiveDate: a.effectiveDate?.toISOString() || '',
      issuedBy: a.issuedBy, status: a.status,
      createdAt: a.createdAt?.toISOString() || '',
    };
  }
}
