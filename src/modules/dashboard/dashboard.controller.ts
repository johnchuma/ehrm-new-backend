import { Controller, Get, Post, Body, Query, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AiService } from '../ai/ai.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly svc: DashboardService,
    private readonly ai: AiService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Employee dashboard summary — attendance today, leave balances, pending tasks, announcements, etc.',
  })
  getEmployeeDashboard(@CurrentUser() user: any) {
    return this.svc.getEmployeeDashboard(user.sub);
  }

  @Get('directory')
  @ApiOperation({ summary: 'Company employee directory (search by name or department)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @RequirePermissions('employees.read')
  getDirectory(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.svc.getDirectory(user.companyId, search, departmentId);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Admin dashboard overview — aggregated KPIs for the company' })
  @RequirePermissions('analytics.read')
  getOverview(@CurrentUser() user: any, @Query('month') month?: number, @Query('year') year?: number) {
    return this.svc.getOverview(user.companyId, month ? Number(month) : undefined, year ? Number(year) : undefined);
  }

  @Get('analytics')
  @ApiOperation({
    summary:
      'Analytics view — KPI strip, headcount/attendance trends, approval queue, attendance command, shift/payroll readiness, system health',
  })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  @RequirePermissions('analytics.read')
  getAnalytics(@CurrentUser() user: any, @Query('month') month?: number, @Query('year') year?: number) {
    return this.svc.getAnalytics(
      user.companyId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get('salaryintelligence')
  @ApiOperation({
    summary:
      'Salary & labour intelligence — compa ratio, pay band coverage, gender pay gap, market delta, critical roles, scenarios',
  })
  @RequirePermissions('analytics.read')
  getSalaryIntelligence(@CurrentUser() user: any) {
    return this.svc.getSalaryIntelligence(user.companyId);
  }

  @Post('exactai')
  @ApiOperation({
    summary:
      'ExactAI — agentic HR assistant. Accepts { messages, context?, conversationId? } and returns grounded reply, suggested actions, and intent. Persists the turn in a conversation thread.',
  })
  exactai(
    @CurrentUser() user: any,
    @Body() body: { messages: any[]; context?: Record<string, any>; conversationId?: string },
  ) {
    const { messages = [], context = {}, conversationId } = body;
    return this.ai.chat(user.companyId, user.sub, messages, context, conversationId);
  }

  @Get('exactai/conversations')
  @ApiOperation({ summary: 'List the current user\u2019s ExactAI conversations (most recent first).' })
  listConversations(@CurrentUser() user: any) {
    return this.ai.listConversations(user.companyId, user.sub);
  }

  @Get('exactai/conversations/:id')
  @ApiOperation({ summary: 'Get a single ExactAI conversation with full message history.' })
  getConversation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ai.getConversation(user.companyId, user.sub, id);
  }

  @Delete('exactai/conversations/:id')
  @ApiOperation({ summary: 'Delete an ExactAI conversation.' })
  deleteConversation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ai.deleteConversation(user.companyId, user.sub, id);
  }

  @Patch('exactai/conversations/:id')
  @ApiOperation({ summary: 'Rename an ExactAI conversation.' })
  renameConversation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { title?: string },
  ) {
    return this.ai.renameConversation(user.companyId, user.sub, id, body?.title || '');
  }
}
