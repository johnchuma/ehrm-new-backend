import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class DepartmentService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async createDepartment(data: any) {
    const dept = await this.prisma.department.create({ data });
    return this.toDeptResponse(dept);
  }

  async getDepartment(id: string) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw GrpcErrors.NOT_FOUND('Department not found');
    return this.toDeptResponse(dept);
  }

  async updateDepartment(id: string, data: any) {
    const dept = await this.prisma.department.update({ where: { id }, data });
    return this.toDeptResponse(dept);
  }

  async deleteDepartment(id: string) {
    await this.prisma.department.delete({ where: { id } });
    return { success: true, message: 'Department deleted' };
  }

  async listDepartments(companyId: string, branchId?: string) {
    const where: any = { companyId };
    if (branchId) where.branchId = branchId;
    const depts = await this.prisma.department.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return { departments: depts.map((d) => this.toDeptResponse(d)) };
  }

  private toDeptResponse(d: any) {
    return {
      id: d.id, companyId: d.companyId, branchId: d.branchId,
      name: d.name, code: d.code, description: d.description,
      headId: d.headId, parentId: d.parentId, isActive: d.isActive,
      createdAt: d.createdAt?.toISOString() || '',
    };
  }
}
