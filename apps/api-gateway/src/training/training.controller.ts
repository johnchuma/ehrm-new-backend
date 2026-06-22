import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Training')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('training')
export class TrainingController {
  private progService: any;
  private enrService: any;
  private certService: any;

  constructor(@Inject(GRPC_SERVICES.TRAINING) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.progService = this.client.getService('ProgramService');
    this.enrService = this.client.getService('EnrollmentService');
    this.certService = this.client.getService('CertificationService');
  }

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
  createProg(@Body() body: any) { return firstValueFrom(this.progService.CreateProgram(body)); }

  @Get('programs')
  listProgs(@Query() query: any) { return firstValueFrom(this.progService.ListPrograms(query)); }

  @Get('programs/:id')
  getProg(@Param('id') id: string) { return firstValueFrom(this.progService.GetProgram({ id })); }

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
  updateProg(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.progService.UpdateProgram({ id, ...body })); }

  @Delete('programs/:id')
  deleteProg(@Param('id') id: string) { return firstValueFrom(this.progService.DeleteProgram({ id })); }

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
  enroll(@Body() body: any) { return firstValueFrom(this.enrService.EnrollEmployee(body)); }

  @Get('enrollments')
  listEnr(@Query() query: any) { return firstValueFrom(this.enrService.ListEnrollments(query)); }

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
  updateEnr(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.enrService.UpdateEnrollment({ id, ...body })); }

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
  issueCert(@Body() body: any) { return firstValueFrom(this.certService.IssueCertification(body)); }

  @Get('certifications')
  listCerts(@Query() query: any) { return firstValueFrom(this.certService.ListCertifications(query)); }
}
