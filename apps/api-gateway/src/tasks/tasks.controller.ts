import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  private service: any;

  constructor(@Inject(GRPC_SERVICES.TASKS) private readonly client: ClientGrpc) {}

  onModuleInit() { this.service = this.client.getService('TaskService'); }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'companyId'],
      properties: {
        title: { type: 'string', example: 'Complete monthly safety inspection report' },
        description: { type: 'string', example: 'Conduct and file the safety inspection for Dar es Salaam warehouse' },
        assignedTo: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'high' },
        dueDate: { type: 'string', example: '2026-07-15' },
        category: { type: 'string', example: 'safety' },
      },
    },
  })
  create(@Body() body: any) { return firstValueFrom(this.service.CreateTask(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.service.ListTasks(query)); }

  @Get(':id')
  get(@Param('id') id: string) { return firstValueFrom(this.service.GetTask({ id })); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Complete monthly safety inspection report' },
        description: { type: 'string', example: 'Updated scope: include electrical systems check' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'urgent' },
        dueDate: { type: 'string', example: '2026-06-30' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed'], example: 'in_progress' },
        progress: { type: 'number', example: 45 },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.service.UpdateTask({ id, ...body })); }

  @Delete(':id')
  remove(@Param('id') id: string) { return firstValueFrom(this.service.DeleteTask({ id })); }

  @Post(':id/assign')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['assigneeId', 'assignedBy'],
      properties: {
        assigneeId: { type: 'string', example: 'emp-002' },
        assignedBy: { type: 'string', example: 'emp-001' },
        notes: { type: 'string', example: 'Please complete this before end of week' },
      },
    },
  })
  assign(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.service.AssignTask({ id, ...body })); }

  @Post(':id/complete')
  complete(@Param('id') id: string) { return firstValueFrom(this.service.CompleteTask({ id })); }
}
