import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
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
}
