import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { TaskService } from '../../../tasks-service/src/tasks/tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TaskService) {}

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
  create(@Body() body: any) { return this.taskService.create(body); }

  @Get()
  list(@Query() query: any) { return this.taskService.list(query.companyId, query); }

  @Get(':id')
  get(@Param('id') id: string) { return this.taskService.get(id); }

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
  update(@Param('id') id: string, @Body() body: any) { return this.taskService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.taskService.delete(id); }

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
  assign(@Param('id') id: string, @Body() body: any) { return this.taskService.assign(id, body.assigneeId); }

  @Post(':id/complete')
  complete(@Param('id') id: string) { return this.taskService.complete(id); }
}
