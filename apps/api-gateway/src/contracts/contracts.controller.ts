import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContractService } from '../../../contracts-service/src/contracts/contracts.service';

@ApiTags('Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly service: ContractService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'type', 'startDate', 'salary'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        type: { type: 'string', example: 'full-time' },
        startDate: { type: 'string', example: '2026-01-01' },
        endDate: { type: 'string', example: '2026-12-31' },
        salary: { type: 'number', example: 1500000 },
        terms: { type: 'string', example: 'Standard employment terms per Tanzania Labour Relations Act' },
        departmentId: { type: 'string', example: 'dept-001' },
        position: { type: 'string', example: 'Software Engineer' },
      },
    },
  })
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  list(@Query() query: any) { return this.service.list(query.companyId, query); }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'full-time' },
        startDate: { type: 'string', example: '2026-01-01' },
        endDate: { type: 'string', example: '2026-12-31' },
        salary: { type: 'number', example: 1800000 },
        terms: { type: 'string', example: 'Updated salary and benefits per collective bargaining agreement' },
        status: { type: 'string', example: 'active' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Post(':id/terminate')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reason', 'terminationDate', 'approvedBy'],
      properties: {
        reason: { type: 'string', example: 'Mutual agreement between employer and employee' },
        terminationDate: { type: 'string', example: '2026-03-31' },
        noticePeriodDays: { type: 'number', example: 30 },
        severancePay: { type: 'number', example: 3000000 },
        approvedBy: { type: 'string', example: 'hr-director-001' },
      },
    },
  })
  terminate(@Param('id') id: string, @Body() body: any) { return this.service.terminate(id, body.reason, body.terminationDate); }

  @Post(':id/renew')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['newEndDate', 'renewedBy'],
      properties: {
        newEndDate: { type: 'string', example: '2027-12-31' },
        salary: { type: 'number', example: 2000000 },
        terms: { type: 'string', example: 'Renewed with updated salary per annual review' },
        renewedBy: { type: 'string', example: 'hr-director-001' },
      },
    },
  })
  renew(@Param('id') id: string, @Body() body: any) { return this.service.renew(id, body.newEndDate, body.salary); }
}
