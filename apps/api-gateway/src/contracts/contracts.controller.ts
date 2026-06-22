import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  private service: any;

  constructor(@Inject(GRPC_SERVICES.CONTRACTS) private readonly client: ClientGrpc) {}

  onModuleInit() { this.service = this.client.getService('ContractService'); }

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
  create(@Body() body: any) { return firstValueFrom(this.service.CreateContract(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.service.ListContracts(query)); }

  @Get(':id')
  get(@Param('id') id: string) { return firstValueFrom(this.service.GetContract({ id })); }

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
  update(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.service.UpdateContract({ id, ...body })); }

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
  terminate(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.service.TerminateContract({ id, ...body })); }

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
  renew(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.service.RenewContract({ id, ...body })); }
}
