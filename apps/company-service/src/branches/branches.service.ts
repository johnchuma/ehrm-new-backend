import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class BranchService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async createBranch(data: any) {
    const branch = await this.prisma.branch.create({ data });
    return this.toBranchResponse(branch);
  }

  async getBranch(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw GrpcErrors.NOT_FOUND('Branch not found');
    return this.toBranchResponse(branch);
  }

  async updateBranch(id: string, data: any) {
    const branch = await this.prisma.branch.update({ where: { id }, data });
    return this.toBranchResponse(branch);
  }

  async deleteBranch(id: string) {
    await this.prisma.branch.delete({ where: { id } });
    return { success: true, message: 'Branch deleted' };
  }

  async listBranches(companyId: string) {
    const branches = await this.prisma.branch.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
    return { branches: branches.map((b) => this.toBranchResponse(b)) };
  }

  private toBranchResponse(b: any) {
    return {
      id: b.id, companyId: b.companyId, name: b.name, code: b.code,
      address: b.address, city: b.city, country: b.country,
      phone: b.phone, email: b.email, managerId: b.managerId,
      isActive: b.isActive, createdAt: b.createdAt?.toISOString() || '',
    };
  }
}
