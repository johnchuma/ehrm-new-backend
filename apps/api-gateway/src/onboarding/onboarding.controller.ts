import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OnboardingService } from '../../../onboarding-service/src/onboarding/onboarding.service';
import { OnboardingTaskService } from '../../../onboarding-service/src/tasks/tasks.service';

@ApiTags('Onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly onbService: OnboardingService,
    private readonly taskService: OnboardingTaskService,
  ) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'position', 'departmentId', 'startDate', 'hiringManagerId'],
      properties: {
        employeeId: { type: 'string', example: 'emp-010' },
        companyId: { type: 'string', example: 'comp-001' },
        position: { type: 'string', example: 'Software Engineer' },
        departmentId: { type: 'string', example: 'dept-003' },
        startDate: { type: 'string', example: '2026-07-01' },
        hiringManagerId: { type: 'string', example: 'emp-005' },
      },
    },
  })
  create(@Body() body: any) { return this.onbService.create(body); }

  @Get()
  list(@Query() query: any) { return this.onbService.list(query.companyId, query.status); }

  @Get(':id')
  get(@Param('id') id: string) { return this.onbService.get(id); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'in_progress' },
        currentStage: { type: 'string', example: 'documentation' },
        notes: { type: 'string', example: 'Waiting for NIDA verification' },
        startDate: { type: 'string', example: '2026-07-01' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return this.onbService.update(id, body); }

  @Post(':id/advance')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['targetStage', 'completedBy'],
      properties: {
        targetStage: { type: 'string', example: 'equipment' },
        notes: { type: 'string', example: 'IT setup completed successfully' },
        completedBy: { type: 'string', example: 'emp-005' },
      },
    },
  })
  advance(@Param('id') id: string, @Body() body: any) { return this.onbService.advanceStage(id, body.targetStage); }

  @Post(':id/complete')
  complete(@Param('id') id: string) { return this.onbService.complete(id); }

  @Post('tasks')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['onboardingId', 'title', 'assigneeId', 'dueDate', 'category'],
      properties: {
        onboardingId: { type: 'string', example: 'onb-001' },
        title: { type: 'string', example: 'Submit academic certificates' },
        description: { type: 'string', example: 'Collect and verify copies of degree certificates' },
        assigneeId: { type: 'string', example: 'emp-010' },
        dueDate: { type: 'string', example: '2026-07-05' },
        category: { type: 'string', example: 'documentation' },
      },
    },
  })
  createTask(@Body() body: any) { return this.taskService.create(body); }

  @Get('tasks/:onboardingId')
  listTasks(@Param('onboardingId') onboardingId: string) { return this.taskService.list(onboardingId); }

  @Post('tasks/:id/complete')
  completeTask(@Param('id') id: string) { return this.taskService.complete(id); }
}
