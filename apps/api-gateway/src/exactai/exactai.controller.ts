import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('ExactAI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class ExactAIController {
  private service: any;

  constructor(@Inject(GRPC_SERVICES.EXACTAI) private readonly client: ClientGrpc) {}

  onModuleInit() { this.service = this.client.getService('AIService'); }

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
  chat(@Body() body: any) { return firstValueFrom(this.service.Chat(body)); }

  @Get('summarize/:employeeId')
  summarize(@Param('employeeId') employeeId: string) { return firstValueFrom(this.service.SummarizeEmployee({ employeeId })); }

  @Get('insights')
  insights(@Query() query: any) { return firstValueFrom(this.service.GetInsights(query)); }

  @Get('attrition')
  predict(@Query() query: any) { return firstValueFrom(this.service.PredictAttrition(query)); }

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
  recommend(@Body() body: any) { return firstValueFrom(this.service.RecommendActions(body)); }
}
