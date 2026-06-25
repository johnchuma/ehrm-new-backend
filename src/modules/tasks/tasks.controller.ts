import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly svc: TasksService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get tasks assigned to me' })
  @ApiQuery({ name: 'status', required: false, enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] })
  getMyTasks(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.svc.getMyTasks(user.sub, status);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update my task status' })
  updateTask(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.svc.updateTaskStatus(user.sub, id, body.status);
  }

  @Get()
  @ApiOperation({ summary: '[Manager/HR] Get company tasks' })
  @ApiQuery({ name: 'assigneeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getCompanyTasks(
    @CurrentUser() user: any,
    @Query('assigneeId') assigneeId?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.getCompanyTasks(user.companyId, assigneeId, status);
  }

  @Post()
  @ApiOperation({ summary: '[Manager/HR] Create a task' })
  createTask(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.createTask({ ...body, companyId: user.companyId, createdById: user.sub });
  }
}
