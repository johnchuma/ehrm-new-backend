import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AttendanceAdminService } from './attendance-admin.service';

@ApiTags('Attendance Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance-admin')
export class AttendanceAdminController {
  constructor(private readonly svc: AttendanceAdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get attendance admin overview' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  overview(@CurrentUser() user: any, @Query('month') month?: string, @Query('year') year?: string) {
    return this.svc.overview(user.companyId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get workspace locations used for geofencing' })
  listLocations(@CurrentUser() user: any) {
    return this.svc.listLocations(user.companyId);
  }

  @Post('bulk-submissions')
  @ApiOperation({ summary: 'Submit bulk attendance marking for approval' })
  submitBulk(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.bulkSubmit(user.companyId, body, user);
  }

  @Post('bulk-submissions/:id/approve')
  @ApiOperation({ summary: 'Approve a bulk attendance submission' })
  approveBulk(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.approveSubmission(user.companyId, id, user);
  }

  @Put('locations/:id')
  @ApiOperation({ summary: 'Update a geofence location' })
  updateLocation(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.updateLocation(user.companyId, id, body);
  }
}