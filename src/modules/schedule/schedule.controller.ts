import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ScheduleService, SwapRequestDto } from './schedule.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly svc: ScheduleService) {}

  private requireCompany(user: any) {
    const companyId = user?.companyId || user?.selectedCompanyId || null;
    if (!companyId) throw new BadRequestException('Company not selected');
    return companyId;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my monthly schedule (shifts, attendance, leaves, holidays)' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getMySchedule(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.svc.getMySchedule(
      user.sub,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('holidays')
  @ApiOperation({ summary: 'Get public holidays for a year' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getPublicHolidays(@CurrentUser() user: any, @Query('year') year?: string) {
    return this.svc.getPublicHolidays(user.sub, year ? parseInt(year) : undefined);
  }

  @Post('swap/request')
  @HttpCode(201)
  @ApiOperation({ summary: 'Request a shift swap with a colleague' })
  requestSwap(@CurrentUser() user: any, @Body() dto: SwapRequestDto) {
    return this.svc.requestSwap(user.sub, dto);
  }

  @Get('swap/me')
  @ApiOperation({ summary: 'Get my swap requests (sent and received)' })
  getMySwapRequests(@CurrentUser() user: any) {
    return this.svc.getMySwapRequests(user.sub);
  }

  @Put('swap/:id/respond')
  @ApiOperation({ summary: 'Accept or reject a swap request sent to me' })
  respondToSwap(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { accept: boolean },
  ) {
    return this.svc.respondToSwap(user.sub, id, body.accept);
  }

  @Get('admin/overview')
  @ApiOperation({ summary: 'Get admin schedule overview' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getAdminOverview(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.svc.getAdminOverview(
      this.requireCompany(user),
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Post('admin/patterns')
  @ApiOperation({ summary: 'Create a shift pattern' })
  createPattern(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.createPattern(this.requireCompany(user), body);
  }

  @Put('admin/patterns/:id')
  @ApiOperation({ summary: 'Update a shift pattern' })
  updatePattern(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.updatePattern(this.requireCompany(user), id, body);
  }

  @Post('admin/assignments')
  @ApiOperation({ summary: 'Create a shift assignment' })
  createAssignment(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.createAssignment(this.requireCompany(user), body);
  }

  @Put('admin/assignments/:id')
  @ApiOperation({ summary: 'Update a shift assignment' })
  updateAssignment(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.updateAssignment(this.requireCompany(user), id, body);
  }

  @Put('admin/swaps/:id/respond')
  @ApiOperation({ summary: 'Admin respond to a swap request' })
  respondToSwapAdmin(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { accept: boolean },
  ) {
    return this.svc.respondToSwapAdmin(this.requireCompany(user), id, body.accept, user?.fullName || user?.email || user?.sub || null);
  }
}
