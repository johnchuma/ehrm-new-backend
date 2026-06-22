import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Salary Intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('salary-intelligence')
export class SalaryIntelligenceController {
  private service: any;

  constructor(@Inject(GRPC_SERVICES.SALARY_INTELLIGENCE) private readonly client: ClientGrpc) {}

  onModuleInit() { this.service = this.client.getService('SalaryIntelligenceService'); }

  @Get('benchmarks')
  benchmarks(@Query() query: any) { return firstValueFrom(this.service.GetBenchmarks(query)); }

  @Get('compensation')
  compensation(@Query() query: any) { return firstValueFrom(this.service.GetCompensationAnalysis(query)); }

  @Get('structure/:companyId')
  structure(@Param('companyId') companyId: string) { return firstValueFrom(this.service.GetSalaryStructure({ companyId })); }

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
  simulate(@Body() body: any) { return firstValueFrom(this.service.SimulateSalary(body)); }
}
