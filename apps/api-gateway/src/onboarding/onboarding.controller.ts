import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  private onbService: any;
  private taskService: any;

  constructor(@Inject(GRPC_SERVICES.ONBOARDING) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.onbService = this.client.getService('OnboardingService');
    this.taskService = this.client.getService('OnboardingTaskService');
  }

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
  create(@Body() body: any) { return firstValueFrom(this.onbService.CreateOnboarding(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.onbService.ListOnboardings(query)); }

  @Get(':id')
  get(@Param('id') id: string) { return firstValueFrom(this.onbService.GetOnboarding({ id })); }

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
  update(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.onbService.UpdateOnboarding({ id, ...body })); }

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
  advance(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.onbService.AdvanceStage({ id, ...body })); }

  @Post(':id/complete')
  complete(@Param('id') id: string) { return firstValueFrom(this.onbService.CompleteOnboarding({ id })); }

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
  createTask(@Body() body: any) { return firstValueFrom(this.taskService.CreateTask(body)); }

  @Get('tasks/:onboardingId')
  listTasks(@Param('onboardingId') onboardingId: string) { return firstValueFrom(this.taskService.ListTasks({ onboardingId })); }

  @Post('tasks/:id/complete')
  completeTask(@Param('id') id: string) { return firstValueFrom(this.taskService.CompleteTask({ id })); }
}
