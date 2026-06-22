import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationService } from './notifications.service';

@Controller()
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @GrpcMethod('NotificationService', 'CreateNotification')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('NotificationService', 'GetNotification')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('NotificationService', 'MarkAsRead')
  markRead(data: { id: string }) { return this.service.markAsRead(data.id); }

  @GrpcMethod('NotificationService', 'MarkAllAsRead')
  markAll(data: { userId: string }) { return this.service.markAllAsRead(data.userId); }

  @GrpcMethod('NotificationService', 'DeleteNotification')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('NotificationService', 'ListNotifications')
  list(data: { userId: string; unreadOnly?: boolean; page?: number; pageSize?: number }) {
    return this.service.list(data.userId, data.unreadOnly, data.page || 1, data.pageSize || 20);
  }

  @GrpcMethod('NotificationService', 'GetUnreadCount')
  unread(data: { userId: string }) { return this.service.getUnreadCount(data.userId); }
}
