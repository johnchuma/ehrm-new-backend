import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Contracts')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contracts: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'List contracts' })
  @RequirePermissions('contracts.read')
  list(@Query() q: any) {
    return this.contracts.list({
      companyId: q.companyId,
      employeeId: q.employeeId,
      status: q.status,
      search: q.search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'KPI counts for the contracts dashboard' })
  @RequirePermissions('contracts.read')
  stats(@Query('companyId') companyId: string) {
    return this.contracts.stats(companyId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Contracts expiring soon and probation ending soon' })
  @RequirePermissions('contracts.read')
  alerts(@Query('companyId') companyId: string) {
    return this.contracts.alerts(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Contract history for one employee' })
  @RequirePermissions('contracts.read')
  history(@Param('employeeId') employeeId: string) {
    return this.contracts.historyForEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one contract' })
  @RequirePermissions('contracts.read')
  get(@Param('id') id: string) {
    return this.contracts.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create contract' })
  @RequirePermissions('contracts.write')
  create(@Body() body: any) {
    return this.contracts.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contract' })
  @RequirePermissions('contracts.write')
  update(@Param('id') id: string, @Body() body: any) {
    return this.contracts.update(id, body);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a pending contract and activate it' })
  @RequirePermissions('contracts.manage')
  approve(@Param('id') id: string, @Body() body: { approvedBy?: string }) {
    return this.contracts.approve(id, body);
  }

  @Post(':id/extend')
  @ApiOperation({ summary: 'Extend the end date of an existing contract' })
  @RequirePermissions('contracts.manage')
  extend(@Param('id') id: string, @Body() body: { newEndDate: string; notes?: string }) {
    return this.contracts.extend(id, body);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew a contract — closes the old one and creates a successor' })
  @RequirePermissions('contracts.manage')
  renew(@Param('id') id: string, @Body() body: any) {
    return this.contracts.renew(id, body);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate a contract and trigger offboarding' })
  @RequirePermissions('contracts.manage')
  terminate(
    @Param('id') id: string,
    @Body() body: { reason: string; notes?: string; terminatedBy?: string; effectiveDate?: string },
  ) {
    return this.contracts.terminate(id, body);
  }

  @Post(':id/document')
  @ApiOperation({ summary: 'Attach an uploaded file URL to the contract' })
  @RequirePermissions('contracts.write')
  attachFile(@Param('id') id: string, @Body() body: { fileUrl: string; fileName?: string }) {
    return this.contracts.attachFile(id, body);
  }
}
