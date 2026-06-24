import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgramService } from '../../../training-service/src/programs/programs.service';
import { EnrollmentService } from '../../../training-service/src/enrollments/enrollments.service';
import { CertificationService } from '../../../training-service/src/certifications/certifications.service';

@ApiTags('Training')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('training')
export class TrainingController {
  constructor(
    private readonly progService: ProgramService,
    private readonly enrService: EnrollmentService,
    private readonly certService: CertificationService,
  ) {}

  @Post('programs')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'title', 'category', 'startDate', 'endDate'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        title: { type: 'string', example: 'Leadership Development Program' },
        description: { type: 'string', example: 'Advanced leadership skills for mid-level managers' },
        category: { type: 'string', example: 'leadership' },
        startDate: { type: 'string', example: '2026-07-01' },
        endDate: { type: 'string', example: '2026-09-30' },
        maxParticipants: { type: 'number', example: 20 },
        instructor: { type: 'string', example: 'Dr. Amina Mwalimu' },
      },
    },
  })
  createProg(@Body() body: any) { return this.progService.create(body); }

  @Get('programs')
  listProgs(@Query() query: any) { return this.progService.list(query.companyId, query); }

  @Get('programs/:id')
  getProg(@Param('id') id: string) { return this.progService.get(id); }

  @Put('programs/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Leadership Development Program' },
        description: { type: 'string', example: 'Updated curriculum for modern leadership' },
        startDate: { type: 'string', example: '2026-07-15' },
        endDate: { type: 'string', example: '2026-10-15' },
        maxParticipants: { type: 'number', example: 25 },
        status: { type: 'string', example: 'active' },
      },
    },
  })
  updateProg(@Param('id') id: string, @Body() body: any) { return this.progService.update(id, body); }

  @Delete('programs/:id')
  deleteProg(@Param('id') id: string) { return this.progService.delete(id); }

  @Post('enrollments')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['programId', 'employeeId', 'companyId'],
      properties: {
        programId: { type: 'string', example: 'prog-001' },
        employeeId: { type: 'string', example: 'emp-003' },
        companyId: { type: 'string', example: 'comp-001' },
      },
    },
  })
  enroll(@Body() body: any) { return this.enrService.enroll(body); }

  @Get('enrollments')
  listEnr(@Query() query: any) { return this.enrService.list(query.programId, query.employeeId); }

  @Put('enrollments/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'completed' },
        completionDate: { type: 'string', example: '2026-09-28' },
        score: { type: 'number', example: 87 },
        certificateUrl: { type: 'string', example: 'https://certs.example.com/cert-001.pdf' },
      },
    },
  })
  updateEnr(@Param('id') id: string, @Body() body: any) { return this.enrService.update(id, body); }

  @Post('certifications')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'programId', 'name', 'issuingBody', 'issueDate'],
      properties: {
        employeeId: { type: 'string', example: 'emp-003' },
        programId: { type: 'string', example: 'prog-001' },
        name: { type: 'string', example: 'Certified Leadership Professional' },
        issuingBody: { type: 'string', example: ' Tanzania Institute of Management' },
        issueDate: { type: 'string', example: '2026-09-30' },
        expiryDate: { type: 'string', example: '2029-09-30' },
      },
    },
  })
  issueCert(@Body() body: any) { return this.certService.issue(body); }

  @Get('certifications')
  listCerts(@Query() query: any) { return this.certService.list(query.employeeId, query.companyId); }
}
