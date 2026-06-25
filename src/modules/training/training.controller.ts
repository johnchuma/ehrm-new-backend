import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Training')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('training')
export class TrainingController {
  constructor(private readonly svc: TrainingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available trainings (with my enrollment status)' })
  getAvailableTrainings(@CurrentUser() user: any) {
    return this.svc.getAvailableTrainings(user.sub);
  }

  @Get('me/enrollments')
  @ApiOperation({ summary: 'Get my training enrollments' })
  getMyEnrollments(@CurrentUser() user: any) {
    return this.svc.getMyEnrollments(user.sub);
  }

  @Post(':id/enroll')
  @HttpCode(200)
  @ApiOperation({ summary: 'Enroll in a training' })
  enroll(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.enroll(user.sub, id);
  }

  @Post(':id/complete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark training as completed (self-reported)' })
  markComplete(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { score?: number }) {
    return this.svc.markComplete(user.sub, id, body.score);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get training details with enrollment list (admin/manager)' })
  getTrainingById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.getTrainingById(user.companyId, id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '[Admin/HR] Create a training program' })
  createTraining(@CurrentUser() user: any, @Body() dto: any) {
    return this.svc.createTraining(user.companyId, dto);
  }
}
