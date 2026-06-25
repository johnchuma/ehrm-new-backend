import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async send(userId: string, data: { type?: string; title: string; message: string; link?: string; companyId?: string }) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: data.type ?? 'INFO',
        title: data.title,
        message: data.message,
        link: data.link,
        companyId: data.companyId,
      },
    });
  }

  async sendBulk(userIds: string[], data: { type?: string; title: string; message: string; link?: string; companyId?: string }) {
    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: data.type ?? 'INFO',
        title: data.title,
        message: data.message,
        link: data.link,
        companyId: data.companyId,
      })),
    });
  }
}
