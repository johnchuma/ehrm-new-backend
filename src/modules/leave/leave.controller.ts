import { Controller, Get, Post, Delete, Put, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeaveService, ApplyLeaveDto } from './leave.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly svc: LeaveService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get available leave types' })
  getLeaveTypes(@CurrentUser() user: any) {
    return this.svc.getLeaveTypes(user.sub);
  }

  @Get('me/balance')
  @ApiOperation({ summary: 'Get my leave balances for current year' })
  getMyBalances(@CurrentUser() user: any) {
    return this.svc.getMyBalances(user.sub);
  }

  @Get('me/applications')
  @ApiOperation({ summary: 'Get my leave applications' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] })
  getMyApplications(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.svc.getMyApplications(user.sub, status);
  }

  @Post('me/apply')
  @HttpCode(201)
  @ApiOperation({ summary: 'Apply for leave' })
  applyLeave(@CurrentUser() user: any, @Body() dto: ApplyLeaveDto) {
    return this.svc.applyLeave(user.sub, dto);
  }

  @Delete('me/:id')
  @ApiOperation({ summary: 'Cancel a pending leave request' })
  cancelLeave(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.cancelLeave(user.sub, id);
  }

  // Manager Self-Service

  @Get('team')
  @ApiOperation({ summary: '[MSS] Get team leave requests' })
  @ApiQuery({ name: 'status', required: false })
  getTeamLeave(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.svc.getTeamLeaveRequests(user.sub, status);
  }

  @Put('team/:id/approve')
  @ApiOperation({ summary: '[MSS] Approve or reject a leave request' })
  approveLeave(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVED' | 'REJECTED'; reason?: string },
  ) {
    return this.svc.approveLeave(user.sub, id, body.action, body.reason);
  }
}
