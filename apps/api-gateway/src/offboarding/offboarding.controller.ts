import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OffboardingService } from '../../../offboarding-service/src/offboarding/offboarding.service';
import { ClearanceService } from '../../../offboarding-service/src/clearance/clearance.service';

@ApiTags('Offboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offboarding')
export class OffboardingController {
  constructor(
    private readonly offService: OffboardingService,
    private readonly clrService: ClearanceService,
  ) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'reason', 'lastWorkingDay'],
      properties: {
        employeeId: { type: 'string', example: 'emp-015' },
        companyId: { type: 'string', example: 'comp-001' },
        reason: { type: 'string', example: 'Resignation' },
        lastWorkingDay: { type: 'string', example: '2026-08-15' },
        handoverTo: { type: 'string', example: 'emp-020' },
      },
    },
  })
  create(@Body() body: any) { return this.offService.create(body); }

  @Get()
  list(@Query() query: any) { return this.offService.list(query.companyId, query.status); }

  @Get(':id')
  get(@Param('id') id: string) { return this.offService.get(id); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'in_progress' },
        lastWorkingDay: { type: 'string', example: '2026-08-15' },
        reason: { type: 'string', example: 'Resignation - relocated to Dar es Salaam' },
        notes: { type: 'string', example: 'Handover meeting scheduled for Aug 10' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return this.offService.update(id, body); }

  @Post(':id/clearance')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['department', 'checklistItems'],
      properties: {
        department: { type: 'string', example: 'IT Department' },
        checklistItems: {
          type: 'array',
          items: { type: 'string' },
          example: ['Return laptop', 'Return access badge', 'Transfer project files'],
        },
        notes: { type: 'string', example: 'All IT equipment to be returned by Aug 12' },
      },
    },
  })
  advance(@Param('id') id: string, @Body() body: any) { return this.offService.advanceClearance(id, body.department); }

  @Post(':id/complete')
  complete(@Param('id') id: string) { return this.offService.complete(id); }

  @Post('clearance')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['offboardingId', 'department', 'checklistItems'],
      properties: {
        offboardingId: { type: 'string', example: 'off-001' },
        department: { type: 'string', example: 'Finance Department' },
        checklistItems: {
          type: 'array',
          items: { type: 'string' },
          example: ['Settle outstanding advances', 'Return company credit card', 'Clear petty cash'],
        },
      },
    },
  })
  createClr(@Body() body: any) { return this.clrService.create(body); }

  @Get('clearance/:offboardingId')
  listClr(@Param('offboardingId') offboardingId: string) { return this.clrService.list(offboardingId); }

  @Post('clearance/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string', example: 'emp-005' },
        notes: { type: 'string', example: 'All items verified and returned in good condition' },
      },
    },
  })
  approveClr(@Param('id') id: string, @Body() body: any) { return this.clrService.approve(id, 'Approved', body.notes); }
}
