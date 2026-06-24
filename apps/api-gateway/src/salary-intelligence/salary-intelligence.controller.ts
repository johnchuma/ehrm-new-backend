import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SalaryIntelligenceService } from '../../../salary-intelligence-service/src/salary-intelligence/salary-intelligence.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Salary Intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('salary-intelligence')
export class SalaryIntelligenceController {
  constructor(private readonly salaryIntelligenceService: SalaryIntelligenceService) {}

  @Get('benchmarks')
  benchmarks(@Query() query: any) { return this.salaryIntelligenceService.getBenchmarks(query.companyId, query.jobTitle, query.department); }

  @Get('compensation')
  compensation(@Query() query: any) { return this.salaryIntelligenceService.getCompensationAnalysis(query.companyId, query.departmentId); }

  @Get('structure/:companyId')
  structure(@Param('companyId') companyId: string) { return this.salaryIntelligenceService.getSalaryStructure(companyId); }

  @Post('simulate')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'employeeId', 'newPosition', 'newDepartment', 'newSalary', 'effectiveDate'],
      properties: {
        companyId: { type: 'string', example: 'comp-tz-001' },
        employeeId: { type: 'string', example: 'emp-001' },
        newPosition: { type: 'string', example: 'Senior Software Engineer' },
        newDepartment: { type: 'string', example: 'Engineering' },
        newSalary: { type: 'number', example: 4500000 },
        effectiveDate: { type: 'string', example: '2026-07-01' },
      },
    },
  })
  simulate(@Body() body: any) { return this.salaryIntelligenceService.simulateSalary(body.companyId, body.employeeId, body.newSalary); }
}
