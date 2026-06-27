import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OffboardingService } from './offboarding.service';

@ApiTags('Offboarding')
@Controller('offboarding')
export class OffboardingController {
  constructor(private readonly offboarding: OffboardingService) {}

  @Get()
  @ApiOperation({ summary: 'List offboarding cases' })
  list(@Query() query: any) {
    return this.offboarding.list({
      companyId: query.companyId,
      employeeId: query.employeeId,
      status: query.status,
      search: query.search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Offboarding dashboard metrics' })
  stats(@Query('companyId') companyId: string) {
    return this.offboarding.stats(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Offboarding history for one employee' })
  history(@Param('employeeId') employeeId: string) {
    return this.offboarding.historyForEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one offboarding case' })
  get(@Param('id') id: string) {
    return this.offboarding.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create offboarding case' })
  create(@Body() body: any) {
    return this.offboarding.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update offboarding case' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.offboarding.update(id, body);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve an offboarding case and move it into progress' })
  approve(@Param('id') id: string, @Body() body: { approvedBy?: string }) {
    return this.offboarding.approve(id, body);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark an offboarding case as completed' })
  complete(@Param('id') id: string, @Body() body: { completedBy?: string; notes?: string }) {
    return this.offboarding.complete(id, body);
  }
}
