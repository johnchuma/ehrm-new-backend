import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  private async getEmployeeByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not found for this user');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  async getMyProfile(userId: string) {
    const { employeeId } = await this.getEmployeeByUserId(userId);
    return this.prisma.employee.findUniqueOrThrow({
      where: { id: employeeId },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const { employeeId } = await this.getEmployeeByUserId(userId);
    const ALLOWED = [
      'city', 'address', 'maritalStatus', 'emergencyName', 'emergencyPhone',
      'emergencyRelation', 'bankName', 'bankAccount', 'bankBranch', 'mobileMoney',
      'mobileMoneyName', 'nationalId', 'tin', 'nssfNumber',
    ] as const;
    const data: Record<string, any> = {};
    for (const key of ALLOWED) {
      if (dto[key] !== undefined) data[key] = dto[key];
    }
    return this.prisma.employee.update({ where: { id: employeeId }, data });
  }

  async getMyDocuments(userId: string) {
    const { employeeId } = await this.getEmployeeByUserId(userId);
    return this.prisma.employeeDocument.findMany({
      where: { employeeId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  // Manager self-service — direct reports
  async getDirectReports(userId: string) {
    const { employeeId, companyId } = await this.getEmployeeByUserId(userId);
    return this.prisma.employee.findMany({
      where: { managerId: employeeId, companyId },
      select: {
        id: true,
        employeeNumber: true,
        jobTitle: true,
        status: true,
        department: { select: { id: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true, fullName: true, email: true } },
      },
    });
  }

  async getOrgChart(userId: string) {
    const { companyId } = await this.getEmployeeByUserId(userId);
    return this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      select: {
        id: true,
        managerId: true,
        jobTitle: true,
        department: { select: { name: true } },
        user: { select: { fullName: true } },
      },
    });
  }
}

export interface UpdateProfileDto {
  city?: string;
  address?: string;
  maritalStatus?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  mobileMoney?: string;
  mobileMoneyName?: string;
  nationalId?: string;
  tin?: string;
  nssfNumber?: string;
}
