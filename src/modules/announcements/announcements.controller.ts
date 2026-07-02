import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnnouncementsService, CreateAnnouncementDto } from './announcements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly svc: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get company announcements visible to me' })
  getAnnouncements(@CurrentUser() user: any) {
    return this.svc.getAnnouncements(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement detail' })
  getById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.getAnnouncementById(user.sub, id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '[Admin/HR] Create an announcement' })
  @RequirePermissions('settings.write')
  create(@CurrentUser() user: any, @Body() dto: CreateAnnouncementDto) {
    return this.svc.createAnnouncement(user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[Admin/HR] Delete an announcement' })
  @RequirePermissions('settings.delete')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.deleteAnnouncement(user.sub, id);
  }
}
