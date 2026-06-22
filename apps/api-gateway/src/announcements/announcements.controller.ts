import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('announcements')
export class AnnouncementsController {
  private service: any;

  constructor(@Inject(GRPC_SERVICES.ANNOUNCEMENTS) private readonly client: ClientGrpc) {}

  onModuleInit() { this.service = this.client.getService('AnnouncementService'); }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'title', 'content', 'authorId'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        title: { type: 'string', example: 'Office Closure During Eid festivities' },
        content: { type: 'string', example: 'The office will be closed from April 10-12 in observance of Eid El Fitr. Please plan accordingly.' },
        authorId: { type: 'string', example: 'emp-001' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
        targetAudience: { type: 'string', enum: ['all', 'hr', 'finance', 'operations'], example: 'all' },
        expiresAt: { type: 'string', example: '2026-04-12T23:59:59Z' },
      },
    },
  })
  create(@Body() body: any) { return firstValueFrom(this.service.CreateAnnouncement(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.service.ListAnnouncements(query)); }

  @Get(':id')
  get(@Param('id') id: string) { return firstValueFrom(this.service.GetAnnouncement({ id })); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated: Office Closure During Eid festivities' },
        content: { type: 'string', example: 'The office will now close from April 9-12. Emergency contacts available on-call.' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
        targetAudience: { type: 'string', enum: ['all', 'hr', 'finance', 'operations'], example: 'all' },
        expiresAt: { type: 'string', example: '2026-04-12T23:59:59Z' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.service.UpdateAnnouncement({ id, ...body })); }

  @Delete(':id')
  remove(@Param('id') id: string) { return firstValueFrom(this.service.DeleteAnnouncement({ id })); }
}
