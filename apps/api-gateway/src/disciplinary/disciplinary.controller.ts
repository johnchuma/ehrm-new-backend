import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CaseService } from '../../../disciplinary-service/src/cases/cases.service';
import { ActionService } from '../../../disciplinary-service/src/actions/actions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Disciplinary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disciplinary')
export class DisciplinaryController {
  constructor(
    private readonly caseService: CaseService,
    private readonly actService: ActionService,
  ) {}

  @Post('cases')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'category', 'description', 'reportedBy', 'incidentDate'],
      properties: {
        employeeId: { type: 'string', example: 'emp_001' },
        companyId: { type: 'string', example: 'comp_tz_001' },
        category: { type: 'string', example: 'Misconduct' },
        description: { type: 'string', example: 'Employee reported late for duty without valid justification on three consecutive days' },
        reportedBy: { type: 'string', example: 'emp_010' },
        incidentDate: { type: 'string', example: '2026-06-15' },
        witnesses: { type: 'array', items: { type: 'string' }, example: ['emp_020', 'emp_025'] },
      },
    },
  })
  createCase(@Body() body: any) { return this.caseService.create(body); }

  @Get('cases')
  listCases(@Query() query: any) { return this.caseService.list(query.companyId, query); }

  @Get('cases/:id')
  getCase(@Param('id') id: string) { return this.caseService.get(id); }

  @Put('cases/:id')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', example: 'Under Review' },
        description: { type: 'string', example: 'Updated description: additional witness statements have been collected' },
        outcome: { type: 'string', example: 'Written Warning' },
        notes: { type: 'string', example: 'Case escalated to HR manager for final determination' },
      },
    },
  })
  updateCase(@Param('id') id: string, @Body() body: any) { return this.caseService.update(id, body); }

  @Post('actions')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['caseId', 'type', 'description', 'issuedBy', 'effectiveDate'],
      properties: {
        caseId: { type: 'string', example: 'case_001' },
        type: { type: 'string', example: 'Written Warning' },
        description: { type: 'string', example: 'Formal written warning for repeated tardiness as per company attendance policy' },
        issuedBy: { type: 'string', example: 'emp_010' },
        effectiveDate: { type: 'string', example: '2026-06-20' },
        duration: { type: 'string', example: '6 months' },
      },
    },
  })
  createAction(@Body() body: any) { return this.actService.create(body); }

  @Post('actions/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string', example: 'emp_015' },
        notes: { type: 'string', example: 'Action reviewed and approved by HR Director' },
      },
    },
  })
  approveAction(@Param('id') id: string, @Body() body: any) { return this.actService.approve(id, body.status || 'Approved'); }

  @Get('actions/:caseId')
  listActions(@Param('caseId') caseId: string) { return this.actService.list(caseId); }
}
