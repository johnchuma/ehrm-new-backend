import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class HRQueryService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked to this user');
    return { employeeId: user.employeeId, companyId: user.companyId, userId };
  }

  async getMyQueries(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.hRQuery.findMany({
      where: { employeeId },
      include: {
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { message: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQueryById(userId: string, queryId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const query = await this.prisma.hRQuery.findFirst({
      where: { id: queryId, employeeId },
      include: {
        messages: {
          where: { isInternal: false },
          include: { sender: { select: { fullName: true, id: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!query) throw new NotFoundException('Query not found');
    return query;
  }

  async createQuery(userId: string, dto: CreateQueryDto) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    return this.prisma.hRQuery.create({
      data: {
        employeeId,
        companyId,
        subject: dto.subject,
        category: dto.category ?? 'GENERAL',
        priority: dto.priority ?? 'NORMAL',
        status: 'OPEN',
        messages: {
          create: {
            senderId: userId,
            message: dto.message,
            isInternal: false,
          },
        },
      },
      include: { messages: true },
    });
  }

  async addMessage(userId: string, queryId: string, message: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const query = await this.prisma.hRQuery.findFirst({
      where: { id: queryId, employeeId },
    });
    if (!query) throw new NotFoundException('Query not found');
    if (query.status === 'CLOSED') throw new ForbiddenException('Cannot reply to a closed query');

    return this.prisma.hRQueryMessage.create({
      data: { queryId, senderId: userId, message, isInternal: false },
    });
  }

  // HR staff — all open queries for the company
  async getAllQueries(companyId: string, status?: string) {
    return this.prisma.hRQuery.findMany({
      where: { companyId, ...(status ? { status } : {}) },
      include: {
        employee: { select: { id: true, employeeNumber: true, user: { select: { fullName: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { message: true, createdAt: true },
        },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async replyQuery(userId: string, queryId: string, message: string, isInternal = false, newStatus?: string) {
    const updates: any[] = [
      this.prisma.hRQueryMessage.create({
        data: { queryId, senderId: userId, message, isInternal },
      }),
    ];
    if (newStatus) {
      updates.push(
        this.prisma.hRQuery.update({
          where: { id: queryId },
          data: {
            status: newStatus,
            assignedTo: userId,
            resolvedAt: newStatus === 'RESOLVED' ? new Date() : undefined,
          },
        }),
      );
    }
    const [msg] = await this.prisma.$transaction(updates);
    return msg;
  }
}

export interface CreateQueryDto {
  subject: string;
  message: string;
  category?: string;
  priority?: string;
}
