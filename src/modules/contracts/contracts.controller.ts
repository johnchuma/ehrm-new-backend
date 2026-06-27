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

@ApiTags('Contracts')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contracts: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'List contracts' })
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
  stats(@Query('companyId') companyId: string) {
    return this.contracts.stats(companyId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Contracts expiring soon and probation ending soon' })
  alerts(@Query('companyId') companyId: string) {
    return this.contracts.alerts(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Contract history for one employee' })
  history(@Param('employeeId') employeeId: string) {
    return this.contracts.historyForEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one contract' })
  get(@Param('id') id: string) {
    return this.contracts.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create contract' })
  create(@Body() body: any) {
    return this.contracts.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contract' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.contracts.update(id, body);
  }

  @Post(':id/extend')
  @ApiOperation({ summary: 'Extend the end date of an existing contract' })
  extend(@Param('id') id: string, @Body() body: { newEndDate: string; notes?: string }) {
    return this.contracts.extend(id, body);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew a contract — closes the old one and creates a successor' })
  renew(@Param('id') id: string, @Body() body: any) {
    return this.contracts.renew(id, body);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate a contract and trigger offboarding' })
  terminate(
    @Param('id') id: string,
    @Body() body: { reason: string; notes?: string; terminatedBy?: string; effectiveDate?: string },
  ) {
    return this.contracts.terminate(id, body);
  }

  @Post(':id/document')
  @ApiOperation({ summary: 'Attach an uploaded file URL to the contract' })
  attachFile(@Param('id') id: string, @Body() body: { fileUrl: string; fileName?: string }) {
    return this.contracts.attachFile(id, body);
  }
}
