import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Benefits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('benefits')
export class BenefitsController {
  private benService: any;
  private enrService: any;

  constructor(@Inject(GRPC_SERVICES.BENEFITS) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.benService = this.client.getService('BenefitService');
    this.enrService = this.client.getService('BenefitEnrollmentService');
  }

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
  create(@Body() body: any) { return firstValueFrom(this.benService.CreateBenefit(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.benService.ListBenefits(query)); }

  @Get(':id')
  get(@Param('id') id: string) { return firstValueFrom(this.benService.GetBenefit({ id })); }

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
  update(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.benService.UpdateBenefit({ id, ...body })); }

  @Delete(':id')
  remove(@Param('id') id: string) { return firstValueFrom(this.benService.DeleteBenefit({ id })); }

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
  enroll(@Body() body: any) { return firstValueFrom(this.enrService.EnrollEmployee(body)); }

  @Get('enrollments')
  listEnr(@Query() query: any) { return firstValueFrom(this.enrService.ListEnrollments(query)); }
}
