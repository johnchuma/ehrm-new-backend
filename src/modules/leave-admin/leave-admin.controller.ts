import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LeaveAdminService } from './leave-admin.service';

@ApiTags('Leave Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leave-admin')
export class LeaveAdminController {
  constructor(private readonly svc: LeaveAdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get leave admin overview' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  overview(@CurrentUser() user: any, @Query('month') month?: string, @Query('year') year?: string) {
    return this.svc.overview(user.companyId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }

  @Post('leave-types')
  @ApiOperation({ summary: 'Create a leave type' })
  createLeaveType(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.createLeaveType(user.companyId, body);
  }

  @Put('leave-types/:id')
  @ApiOperation({ summary: 'Update a leave type' })
  updateLeaveType(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.updateLeaveType(user.companyId, id, body);
  }

  @Post('requests')
  @ApiOperation({ summary: 'Create a leave request on behalf of an employee' })
  createRequest(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.createLeaveRequest(user.companyId, body);
  }

  @Post('requests/:id/respond')
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  respond(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { action: 'APPROVED' | 'REJECTED'; reason?: string }) {
    return this.svc.respond(user.companyId, id, body, user);
  }
}