import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class FamilyService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async add(data: any) {
    const member = await this.prisma.family.create({ data });
    return this.toResponse(member);
  }

  async list(employeeId: string) {
    const members = await this.prisma.family.findMany({ where: { employeeId } });
    return { family: members.map((m) => this.toResponse(m)) };
  }

  private toResponse(m: any) {
    return {
      id: m.id, employeeId: m.employeeId, name: m.name,
      relationship: m.relationship, phone: m.phone,
    };
  }
}
