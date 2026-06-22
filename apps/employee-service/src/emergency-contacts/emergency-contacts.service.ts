import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class EmergencyContactService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async add(data: any) {
    const contact = await this.prisma.emergencyContact.create({ data });
    return this.toResponse(contact);
  }

  async list(employeeId: string) {
    const contacts = await this.prisma.emergencyContact.findMany({ where: { employeeId } });
    return { contacts: contacts.map((c) => this.toResponse(c)) };
  }

  private toResponse(c: any) {
    return {
      id: c.id, employeeId: c.employeeId, name: c.name,
      relationship: c.relationship, phone: c.phone, altPhone: c.altPhone,
    };
  }
}
