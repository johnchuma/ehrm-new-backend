import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    return { employeeId: user?.employeeId ?? null, companyId: user?.companyId ?? '' };
  }

  async getAnnouncements(userId: string) {
    const { companyId, employeeId } = await this.resolveEmployee(userId);

    let departmentId: string | undefined;
    let branchId: string | undefined;
    if (employeeId) {
      const emp = await this.prisma.employee.findUnique({
        where: { id: employeeId },
        select: { departmentId: true, branchId: true },
      });
      departmentId = emp?.departmentId ?? undefined;
      branchId = emp?.branchId ?? undefined;
    }

    const now = new Date();
    return this.prisma.announcement.findMany({
      where: {
        companyId,
        publishedAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
        AND: [
          {
            OR: [
              { targetAudience: 'ALL' },
              { targetAudience: 'DEPARTMENT', targetId: departmentId },
              { targetAudience: 'BRANCH', targetId: branchId },
            ],
          },
        ],
      },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
    });
  }

  async getAnnouncementById(userId: string, id: string) {
    const { companyId } = await this.resolveEmployee(userId);
    const a = await this.prisma.announcement.findFirst({ where: { id, companyId } });
    if (!a) throw new NotFoundException('Announcement not found');
    return a;
  }

  async createAnnouncement(userId: string, dto: CreateAnnouncementDto) {
    const { companyId } = await this.resolveEmployee(userId);
    return this.prisma.announcement.create({
      data: {
        companyId,
        title: dto.title,
        body: dto.body,
        type: dto.type ?? 'GENERAL',
        targetAudience: dto.targetAudience ?? 'ALL',
        targetId: dto.targetId,
        pinned: dto.pinned ?? false,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        createdBy: userId,
      },
    });
  }

  async deleteAnnouncement(userId: string, id: string) {
    const { companyId } = await this.resolveEmployee(userId);
    const a = await this.prisma.announcement.findFirst({ where: { id, companyId } });
    if (!a) throw new NotFoundException('Announcement not found');
    return this.prisma.announcement.delete({ where: { id } });
  }
}

export interface CreateAnnouncementDto {
  title: string;
  body: string;
  type?: string;
  targetAudience?: string;
  targetId?: string;
  pinned?: boolean;
  publishedAt?: string;
  expiresAt?: string;
}
