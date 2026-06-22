import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class NotificationService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const n = await this.prisma.notification.create({ data });
    return this.toResponse(n);
  }

  async get(id: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) throw GrpcErrors.NOT_FOUND('Notification not found');
    return this.toResponse(n);
  }

  async markAsRead(id: string) {
    const n = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return this.toResponse(n);
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true, message: 'All notifications marked as read' };
  }

  async delete(id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { success: true, message: 'Notification deleted' };
  }

  async list(userId: string, unreadOnly: boolean = false, page: number = 1, pageSize: number = 20) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    const [items, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications: items.map((n) => this.toResponse(n)), total, unread };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  }

  private toResponse(n: any) {
    return {
      id: n.id, userId: n.userId, companyId: n.companyId, title: n.title,
      message: n.message, type: n.type, link: n.link, category: n.category,
      isRead: n.isRead, createdAt: n.createdAt?.toISOString() || '',
      readAt: n.readAt?.toISOString() || '',
    };
  }
}
