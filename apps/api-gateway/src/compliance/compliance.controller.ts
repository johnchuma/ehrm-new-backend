import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('compliance')
export class ComplianceController {
  private compService: any;
  private statService: any;

  constructor(@Inject(GRPC_SERVICES.COMPLIANCE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.compService = this.client.getService('ComplianceService');
    this.statService = this.client.getService('StatutoryService');
  }

  @Post('requirements')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'title', 'type', 'authority', 'dueDate'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        title: { type: 'string', example: 'Annual WCF Contributions Filing' },
        description: { type: 'string', example: 'Mandatory annual filing of Workers Compensation Fund contributions' },
        type: { type: 'string', example: 'statutory' },
        authority: { type: 'string', example: 'Workers Compensation Fund (WCF)' },
        dueDate: { type: 'string', example: '2026-03-31' },
        penalty: { type: 'string', example: 'TZS 500,000 late filing penalty per month' },
      },
    },
  })
  createReq(@Body() body: any) { return firstValueFrom(this.compService.CreateRequirement(body)); }

  @Get('requirements')
  listReq(@Query() query: any) { return firstValueFrom(this.compService.ListRequirements(query)); }

  @Put('requirements/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Annual WCF Contributions Filing - Updated' },
        description: { type: 'string', example: 'Updated filing with revised contribution amounts' },
        dueDate: { type: 'string', example: '2026-04-30' },
        status: { type: 'string', example: 'in-progress' },
        evidence: { type: 'string', example: 'Receipt #WCF-2026-001' },
      },
    },
  })
  updateReq(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.compService.UpdateRequirement({ id, ...body })); }

  @Post('filings')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'requirementId', 'period', 'dueDate', 'description'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        requirementId: { type: 'string', example: 'req-001' },
        period: { type: 'string', example: '2026-Q1' },
        dueDate: { type: 'string', example: '2026-04-30' },
        description: { type: 'string', example: 'PAYE monthly return for March 2026' },
      },
    },
  })
  createFiling(@Body() body: any) { return firstValueFrom(this.statService.CreateFiling(body)); }

  @Get('filings')
  listFilings(@Query() query: any) { return firstValueFrom(this.statService.ListFilings(query)); }

  @Put('filings/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'approved' },
        submittedDate: { type: 'string', example: '2026-03-28' },
        approvalDate: { type: 'string', example: '2026-04-05' },
        referenceNumber: { type: 'string', example: 'TRA-PAYE-2026-03-001' },
        notes: { type: 'string', example: 'Filing approved by TRA with no issues' },
      },
    },
  })
  updateFiling(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.statService.UpdateFiling({ id, ...body })); }
}
