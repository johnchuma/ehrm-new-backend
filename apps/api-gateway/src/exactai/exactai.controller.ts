import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AIService } from '../../../exactai-service/src/ai/ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('ExactAI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class ExactAIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['message', 'employeeId', 'companyId'],
      properties: {
        message: { type: 'string', example: 'What are the performance metrics for my team this quarter?' },
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-tz-001' },
        context: { type: 'string', example: 'Team lead reviewing Q2 performance data' },
        conversationId: { type: 'string', example: 'conv-abc-123' },
      },
    },
  })
  chat(@Body() body: any) { return this.aiService.chat(body); }

  @Get('summarize/:employeeId')
  summarize(@Param('employeeId') employeeId: string) { return this.aiService.summarizeEmployee(employeeId); }

  @Get('insights')
  insights(@Query() query: any) { return this.aiService.getInsights(query.companyId, query.type); }

  @Get('attrition')
  predict(@Query() query: any) { return this.aiService.predictAttrition(query.companyId, query.departmentId); }

  @Post('recommend')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'scenario'],
      properties: {
        employeeId: { type: 'string', example: 'emp-045' },
        companyId: { type: 'string', example: 'comp-tz-001' },
        scenario: { type: 'string', example: 'High-potential engineer at risk of attrition due to below-market compensation' },
        context: { type: 'string', example: 'Employee has received an external offer at 40% higher salary. Budget available for retention adjustment.' },
      },
    },
  })
  recommend(@Body() body: any) { return this.aiService.recommendActions(body.companyId, body.scenario); }
}
