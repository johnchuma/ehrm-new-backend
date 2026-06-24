import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransferService } from '../../../movement-service/src/transfers/transfers.service';
import { PromotionService } from '../../../movement-service/src/promotions/promotions.service';

@ApiTags('Movement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('movement')
export class MovementController {
  constructor(
    private readonly trService: TransferService,
    private readonly prService: PromotionService,
  ) {}

  @Post('transfers')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'fromDepartment', 'toDepartment', 'effectiveDate', 'reason'],
      properties: {
        employeeId: { type: 'string', example: 'emp_001' },
        companyId: { type: 'string', example: 'comp_tz_001' },
        fromDepartment: { type: 'string', example: 'Finance' },
        toDepartment: { type: 'string', example: 'Operations' },
        fromPosition: { type: 'string', example: 'Accounts Clerk' },
        toPosition: { type: 'string', example: 'Operations Officer' },
        effectiveDate: { type: 'string', example: '2026-07-01' },
        reason: { type: 'string', example: 'Transfer to fill critical vacancy in Operations department, Dar es Salaam office' },
      },
    },
  })
  createTr(@Body() body: any) { return this.trService.create(body); }

  @Get('transfers')
  listTr(@Query() query: any) { return this.trService.list(query.companyId, query.status); }

  @Post('transfers/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string', example: 'emp_020' },
        notes: { type: 'string', example: 'Transfer approved by Department Head pending employee acceptance' },
      },
    },
  })
  approveTr(@Param('id') id: string, @Body() body: any) { return this.trService.approve(id, 'Approved'); }

  @Post('promotions')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'fromPosition', 'toPosition', 'newSalary', 'effectiveDate', 'reason'],
      properties: {
        employeeId: { type: 'string', example: 'emp_003' },
        companyId: { type: 'string', example: 'comp_tz_001' },
        fromPosition: { type: 'string', example: 'Software Developer' },
        toPosition: { type: 'string', example: 'Senior Software Developer' },
        newSalary: { type: 'number', example: 3500000 },
        effectiveDate: { type: 'string', example: '2026-07-01' },
        reason: { type: 'string', example: 'Promotion in recognition of outstanding performance during Q1 2026 review period' },
      },
    },
  })
  createPr(@Body() body: any) { return this.prService.create(body); }

  @Get('promotions')
  listPr(@Query() query: any) { return this.prService.list(query.companyId, query.status); }

  @Post('promotions/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string', example: 'emp_025' },
        notes: { type: 'string', example: 'Promotion approved by Managing Director effective from next payroll cycle' },
      },
    },
  })
  approvePr(@Param('id') id: string, @Body() body: any) { return this.prService.approve(id, 'Approved'); }
}
