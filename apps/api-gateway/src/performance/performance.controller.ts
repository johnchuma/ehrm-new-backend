import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Performance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('performance')
export class PerformanceController {
  private revService: any;
  private goalService: any;
  private kpiService: any;

  constructor(@Inject(GRPC_SERVICES.PERFORMANCE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.revService = this.client.getService('ReviewService');
    this.goalService = this.client.getService('GoalService');
    this.kpiService = this.client.getService('KpiService');
  }

  @Post('reviews')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'reviewerId', 'period', 'startDate', 'endDate', 'overallRating'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        reviewerId: { type: 'string', example: 'emp-005' },
        period: { type: 'string', example: 'Q1 2026' },
        startDate: { type: 'string', example: '2026-01-01' },
        endDate: { type: 'string', example: '2026-03-31' },
        overallRating: { type: 'number', example: 4.2 },
        comments: { type: 'string', example: 'Strong performance in project delivery' },
      },
    },
  })
  createRev(@Body() body: any) { return firstValueFrom(this.revService.CreateReview(body)); }

  @Get('reviews')
  listRev(@Query() query: any) { return firstValueFrom(this.revService.ListReviews(query)); }

  @Get('reviews/:id')
  getRev(@Param('id') id: string) { return firstValueFrom(this.revService.GetReview({ id })); }

  @Put('reviews/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        overallRating: { type: 'number', example: 4.5 },
        comments: { type: 'string', example: 'Excellent teamwork and leadership skills' },
        status: { type: 'string', example: 'approved' },
        strengths: { type: 'array', items: { type: 'string' }, example: ['Communication', 'Problem Solving'] },
        improvements: { type: 'array', items: { type: 'string' }, example: ['Time Management'] },
      },
    },
  })
  updateRev(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.revService.UpdateReview({ id, ...body })); }

  @Post('reviews/:id/submit')
  submitRev(@Param('id') id: string) { return firstValueFrom(this.revService.SubmitReview({ id })); }

  @Post('goals')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'title', 'targetDate', 'metric', 'targetValue'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        title: { type: 'string', example: 'Increase customer satisfaction score' },
        description: { type: 'string', example: 'Improve NPS by 15% through better service delivery' },
        targetDate: { type: 'string', example: '2026-12-31' },
        metric: { type: 'string', example: 'NPS Score' },
        targetValue: { type: 'number', example: 85 },
      },
    },
  })
  createGoal(@Body() body: any) { return firstValueFrom(this.goalService.CreateGoal(body)); }

  @Get('goals')
  listGoals(@Query() query: any) { return firstValueFrom(this.goalService.ListGoals(query)); }

  @Get('goals/:id')
  getGoal(@Param('id') id: string) { return firstValueFrom(this.goalService.GetGoal({ id })); }

  @Put('goals/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Increase customer satisfaction score' },
        description: { type: 'string', example: 'Improve NPS by 20% through enhanced support' },
        targetDate: { type: 'string', example: '2026-12-31' },
        metric: { type: 'string', example: 'NPS Score' },
        targetValue: { type: 'number', example: 90 },
        progress: { type: 'number', example: 65 },
        status: { type: 'string', example: 'in_progress' },
      },
    },
  })
  updateGoal(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.goalService.UpdateGoal({ id, ...body })); }

  @Delete('goals/:id')
  deleteGoal(@Param('id') id: string) { return firstValueFrom(this.goalService.DeleteGoal({ id })); }

  @Post('kpis')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'name', 'metric', 'targetValue', 'weight', 'period'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        name: { type: 'string', example: 'Revenue Generation' },
        description: { type: 'string', example: 'Monthly sales revenue target' },
        metric: { type: 'string', example: 'Revenue (TZS)' },
        targetValue: { type: 'number', example: 50000000 },
        weight: { type: 'number', example: 30 },
        period: { type: 'string', example: 'Q1 2026' },
      },
    },
  })
  createKpi(@Body() body: any) { return firstValueFrom(this.kpiService.CreateKpi(body)); }

  @Get('kpis')
  listKpis(@Query() query: any) { return firstValueFrom(this.kpiService.ListKpis(query)); }

  @Put('kpis/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Revenue Generation' },
        targetValue: { type: 'number', example: 55000000 },
        actualValue: { type: 'number', example: 48000000 },
        weight: { type: 'number', example: 30 },
        status: { type: 'string', example: 'in_progress' },
      },
    },
  })
  updateKpi(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.kpiService.UpdateKpi({ id, ...body })); }
}
