import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { BenefitService } from '../../../benefits-service/src/benefits/benefits.service';
import { EnrollmentService } from '../../../benefits-service/src/enrollments/enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Benefits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('benefits')
export class BenefitsController {
  constructor(
    private readonly benService: BenefitService,
    private readonly enrService: EnrollmentService,
  ) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'type', 'provider', 'premiumAmount', 'coverageAmount'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        name: { type: 'string', example: 'NHIF Medical Cover' },
        description: { type: 'string', example: 'Comprehensive medical insurance for employees and dependants' },
        type: { type: 'string', example: 'medical' },
        provider: { type: 'string', example: 'NHIF Tanzania' },
        premiumAmount: { type: 'number', example: 50000 },
        coverageAmount: { type: 'number', example: 10000000 },
      },
    },
  })
  create(@Body() body: any) { return this.benService.create(body); }

  @Get()
  list(@Query() query: any) { return this.benService.list(query.companyId, query.type); }

  @Get(':id')
  get(@Param('id') id: string) { return this.benService.get(id); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'NHIF Medical Cover Plus' },
        description: { type: 'string', example: 'Enhanced medical insurance with dental and optical coverage' },
        premiumAmount: { type: 'number', example: 75000 },
        coverageAmount: { type: 'number', example: 15000000 },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return this.benService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.benService.delete(id); }

  @Post('enroll')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'benefitId', 'companyId', 'startDate'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        benefitId: { type: 'string', example: 'ben-001' },
        companyId: { type: 'string', example: 'comp-001' },
        startDate: { type: 'string', example: '2026-01-01' },
        nominees: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Jane Mwangi' },
              relationship: { type: 'string', example: 'spouse' },
              percentage: { type: 'number', example: 60 },
            },
          },
          example: [{ name: 'Jane Mwangi', relationship: 'spouse', percentage: 60 }, { name: 'John Mwangi Jr', relationship: 'child', percentage: 40 }],
        },
      },
    },
  })
  enroll(@Body() body: any) { return this.enrService.enroll(body); }

  @Get('enrollments')
  listEnr(@Query() query: any) { return this.enrService.list(query.companyId, query.employeeId); }
}
