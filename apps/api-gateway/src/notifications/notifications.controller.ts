import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { NotificationService } from '../../../notifications-service/src/notifications/notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'companyId', 'title', 'message'],
      properties: {
        userId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        title: { type: 'string', example: 'Leave request approved' },
        message: { type: 'string', example: 'Your annual leave request for July has been approved by the manager.' },
        type: { type: 'string', example: 'info' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
        channels: { type: 'array', items: { type: 'string' }, example: ['in_app', 'email'] },
      },
    },
  })
  create(@Body() body: any) { return this.notificationService.create(body); }

  @Get()
  list(@Query() query: any) { return this.notificationService.list(query.userId, query.unreadOnly, query.page, query.pageSize); }

  @Get(':id')
  get(@Param('id') id: string) { return this.notificationService.get(id); }

  @Post(':id/read')
  markRead(@Param('id') id: string) { return this.notificationService.markAsRead(id); }

  @Post('read-all')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'companyId'],
      properties: {
        userId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        notificationIds: { type: 'array', items: { type: 'string' }, example: ['notif-001', 'notif-002', 'notif-003'] },
      },
    },
  })
  markAll(@Body() body: any) { return this.notificationService.markAllAsRead(body.userId); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.notificationService.delete(id); }

  @Get('unread/:userId')
  unread(@Param('userId') userId: string) { return this.notificationService.getUnreadCount(userId); }
}
