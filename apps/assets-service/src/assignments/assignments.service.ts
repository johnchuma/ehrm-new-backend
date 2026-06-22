import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class AssignmentService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async assign(data: any) {
    const asset = await this.prisma.asset.findUnique({ where: { id: data.assetId } });
    const assignment = await this.prisma.assetAssignment.create({
      data: { ...data, assetName: asset?.name, assignedDate: new Date(data.assignedDate) },
    });
    await this.prisma.asset.update({ where: { id: data.assetId }, data: { status: 'Assigned', assignedTo: data.employeeId } });
    return this.toResponse(assignment);
  }

  async returnAsset(id: string, returnDate: string, condition: string, notes?: string) {
    const assignment = await this.prisma.assetAssignment.update({
      where: { id },
      data: { returnDate: new Date(returnDate), status: 'Returned', condition, notes },
    });
    await this.prisma.asset.update({
      where: { id: assignment.assetId },
      data: { status: 'Available', assignedTo: null, condition },
    });
    return this.toResponse(assignment);
  }

  async list(companyId?: string, employeeId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    const items = await this.prisma.assetAssignment.findMany({ where, orderBy: { assignedDate: 'desc' } });
    return { assignments: items.map((a) => this.toResponse(a)) };
  }

  private toResponse(a: any) {
    return {
      id: a.id, assetId: a.assetId, assetName: a.assetName,
      employeeId: a.employeeId, employeeName: a.employeeName,
      assignedDate: a.assignedDate?.toISOString() || '',
      returnDate: a.returnDate?.toISOString() || '',
      status: a.status, condition: a.condition, notes: a.notes,
    };
  }
}
