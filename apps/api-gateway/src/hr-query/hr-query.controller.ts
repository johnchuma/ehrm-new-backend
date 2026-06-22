import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('HR Query')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr-query')
export class HRQueryController {
  private queryService: any;
  private ticketService: any;

  constructor(@Inject(GRPC_SERVICES.HR_QUERY) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.queryService = this.client.getService('HRQueryService');
    this.ticketService = this.client.getService('HRQueryService');
  }

  @Post('ask')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['question', 'employeeId', 'companyId'],
      properties: {
        question: { type: 'string', example: 'What is the company policy on remote work?' },
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-tz-001' },
        context: { type: 'string', example: 'Employee is requesting to work from home 3 days per week' },
      },
    },
  })
  ask(@Body() body: any) { return firstValueFrom(this.queryService.AskQuestion(body)); }

  @Get('faqs')
  faqs(@Query() query: any) { return firstValueFrom(this.queryService.GetFAQs(query)); }

  @Post('faqs')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'question', 'answer', 'category'],
      properties: {
        companyId: { type: 'string', example: 'comp-tz-001' },
        question: { type: 'string', example: 'How do I apply for annual leave?' },
        answer: { type: 'string', example: 'Submit a leave request through the HR portal at least 7 days in advance.' },
        category: { type: 'string', example: 'Leave Policy' },
        tags: { type: 'array', items: { type: 'string' }, example: ['leave', 'annual', 'hr'] },
      },
    },
  })
  createFaq(@Body() body: any) { return firstValueFrom(this.queryService.CreateFAQ(body)); }

  @Get('tickets')
  listTickets(@Query() query: any) { return firstValueFrom(this.ticketService.ListTickets(query)); }

  @Post('tickets')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'subject', 'description', 'category', 'priority'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-tz-001' },
        subject: { type: 'string', example: 'Salary discrepancy for June 2026' },
        description: { type: 'string', example: 'My June salary was short by TSH 150,000. Please review.' },
        category: { type: 'string', example: 'Salary & Compensation' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'high' },
      },
    },
  })
  createTicket(@Body() body: any) { return firstValueFrom(this.ticketService.CreateTicket(body)); }

  @Post('tickets/:id/reply')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['repliedBy', 'message', 'status'],
      properties: {
        repliedBy: { type: 'string', example: 'emp-002' },
        message: { type: 'string', example: 'The salary discrepancy has been reviewed and corrected. You will receive the adjustment in the next payroll cycle.' },
        status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'], example: 'resolved' },
      },
    },
  })
  reply(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.ticketService.ReplyTicket({ id, ...body })); }
}
