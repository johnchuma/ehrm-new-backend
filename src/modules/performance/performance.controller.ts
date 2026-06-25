import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceService, SelfReviewDto, ManagerReviewDto, CreateGoalDto } from './performance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Performance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('performance')
export class PerformanceController {
  constructor(private readonly svc: PerformanceService) {}

  // ── Self-service ──

  @Get('me/reviews')
  @ApiOperation({ summary: 'Get my performance reviews' })
  getMyReviews(@CurrentUser() user: any) {
    return this.svc.getMyReviews(user.sub);
  }

  @Get('me/reviews/:id')
  @ApiOperation({ summary: 'Get a specific review detail' })
  getReviewById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.getReviewById(user.sub, id);
  }

  @Put('me/reviews/:id/self-review')
  @ApiOperation({ summary: 'Submit self-review for a performance review' })
  submitSelfReview(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: SelfReviewDto) {
    return this.svc.submitSelfReview(user.sub, id, dto);
  }

  @Get('me/goals')
  @ApiOperation({ summary: 'Get my performance goals' })
  getMyGoals(@CurrentUser() user: any) {
    return this.svc.getMyGoals(user.sub);
  }

  @Post('me/goals')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a personal performance goal' })
  createGoal(@CurrentUser() user: any, @Body() dto: CreateGoalDto) {
    return this.svc.createGoal(user.sub, dto);
  }

  @Put('me/goals/:id/progress')
  @ApiOperation({ summary: 'Update goal progress' })
  updateGoalProgress(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { progress: number; status?: string },
  ) {
    return this.svc.updateGoalProgress(user.sub, id, body.progress, body.status);
  }

  // ── Manager Self-Service ──

  @Get('team/reviews')
  @ApiOperation({ summary: '[MSS] Get team performance reviews' })
  getTeamReviews(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.svc.getTeamReviews(user.sub, status);
  }

  @Put('team/reviews/:id/manager-review')
  @ApiOperation({ summary: '[MSS] Submit manager review' })
  submitManagerReview(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: ManagerReviewDto) {
    return this.svc.submitManagerReview(user.sub, id, dto);
  }
}
