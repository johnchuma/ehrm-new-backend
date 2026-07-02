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
import { DisciplinaryService } from './disciplinary.service';

@ApiTags('Disciplinary')
@Controller('disciplinary')
export class DisciplinaryController {
  constructor(private readonly disciplinary: DisciplinaryService) {}

  // ─────────────── Cases ───────────────

  @Get('cases')
  @ApiOperation({ summary: 'List disciplinary cases' })
  listCases(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.disciplinary.listCases({ companyId, status, severity, category, search });
  }

  @Get('cases/stats')
  @ApiOperation({ summary: 'KPI counts for the disciplinary dashboard' })
  caseStats(@Query('companyId') companyId: string) {
    return this.disciplinary.stats(companyId);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get one disciplinary case' })
  getCase(@Param('id') id: string) {
    return this.disciplinary.getCase(id);
  }

  @Post('cases')
  @ApiOperation({ summary: 'Open a disciplinary case' })
  createCase(@Body() body: any) {
    return this.disciplinary.createCase(body);
  }

  @Patch('cases/:id')
  @ApiOperation({ summary: 'Update a disciplinary case' })
  updateCase(@Param('id') id: string, @Body() body: any) {
    return this.disciplinary.updateCase(id, body);
  }

  @Delete('cases/:id')
  @ApiOperation({ summary: 'Delete a disciplinary case' })
  removeCase(@Param('id') id: string) {
    return this.disciplinary.deleteCase(id);
  }

  // ─────────────── Hearings ───────────────

  @Get('hearings/list')
  @ApiOperation({ summary: 'List hearings' })
  listHearings(
    @Query('companyId') companyId: string,
    @Query('caseId') caseId?: string,
    @Query('status') status?: string,
  ) {
    return this.disciplinary.listHearings(companyId, caseId, status);
  }

  @Post('hearings')
  @ApiOperation({ summary: 'Schedule a hearing' })
  createHearing(@Body() body: any) {
    return this.disciplinary.createHearing(body);
  }

  @Patch('hearings/:id')
  @ApiOperation({ summary: 'Update a hearing (postpone, record outcome, etc.)' })
  updateHearing(@Param('id') id: string, @Body() body: any) {
    return this.disciplinary.updateHearing(id, body);
  }

  // ─────────────── Outcomes ───────────────

  @Get('outcomes/list')
  @ApiOperation({ summary: 'List disciplinary outcomes' })
  listOutcomes(@Query('companyId') companyId: string, @Query('caseId') caseId?: string) {
    return this.disciplinary.listOutcomes(companyId, caseId);
  }

  @Post('outcomes')
  @ApiOperation({ summary: 'Record a disciplinary outcome (closes the case)' })
  createOutcome(@Body() body: any) {
    return this.disciplinary.createOutcome(body);
  }

  // ─────────────── Appeals ───────────────

  @Get('appeals/list')
  @ApiOperation({ summary: 'List appeals' })
  listAppeals(
    @Query('companyId') companyId: string,
    @Query('caseId') caseId?: string,
    @Query('status') status?: string,
  ) {
    return this.disciplinary.listAppeals(companyId, caseId, status);
  }

  @Post('appeals')
  @ApiOperation({ summary: 'Submit an appeal' })
  createAppeal(@Body() body: any) {
    return this.disciplinary.createAppeal(body);
  }

  @Patch('appeals/:id')
  @ApiOperation({ summary: 'Update appeal status / decision' })
  updateAppeal(@Param('id') id: string, @Body() body: any) {
    return this.disciplinary.updateAppeal(id, body);
  }
}
