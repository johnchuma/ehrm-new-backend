import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  private service: any;

  constructor(@Inject(GRPC_SERVICES.NOTIFICATIONS) private readonly client: ClientGrpc) {}

  onModuleInit() { this.service = this.client.getService('NotificationService'); }

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
  create(@Body() body: any) { return firstValueFrom(this.service.CreateNotification(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.service.ListNotifications(query)); }

  @Get(':id')
  get(@Param('id') id: string) { return firstValueFrom(this.service.GetNotification({ id })); }

  @Post(':id/read')
  markRead(@Param('id') id: string) { return firstValueFrom(this.service.MarkAsRead({ id })); }

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
  markAll(@Body() body: any) { return firstValueFrom(this.service.MarkAllAsRead(body)); }

  @Delete(':id')
  remove(@Param('id') id: string) { return firstValueFrom(this.service.DeleteNotification({ id })); }

  @Get('unread/:userId')
  unread(@Param('userId') userId: string) { return firstValueFrom(this.service.GetUnreadCount({ userId })); }
}
