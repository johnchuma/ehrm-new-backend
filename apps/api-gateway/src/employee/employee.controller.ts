import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Employee')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employee')
export class EmployeeController {
  private empService: any;
  private docService: any;
  private qualService: any;
  private ecService: any;
  private famService: any;

  constructor(@Inject(GRPC_SERVICES.EMPLOYEE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.empService = this.client.getService('EmployeeService');
    this.docService = this.client.getService('DocumentService');
    this.qualService = this.client.getService('QualificationService');
    this.ecService = this.client.getService('EmergencyContactService');
    this.famService = this.client.getService('FamilyService');
  }

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth', 'hireDate', 'departmentId', 'position', 'salary'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Mwangi' },
        email: { type: 'string', example: 'john.mwangi@example.co.tz' },
        phone: { type: 'string', example: '+255712345678' },
        gender: { type: 'string', example: 'Male' },
        dateOfBirth: { type: 'string', example: '1990-05-15' },
        hireDate: { type: 'string', example: '2024-01-10' },
        departmentId: { type: 'string', example: 'dept-001' },
        position: { type: 'string', example: 'Software Engineer' },
        salary: { type: 'number', example: 1500000 },
      },
    },
  })
  create(@Body() body: any) { return firstValueFrom(this.empService.CreateEmployee(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.empService.ListEmployees(query)); }

  @Get(':id')
  get(@Param('id') id: string) { return firstValueFrom(this.empService.GetEmployee({ id })); }

  @Get(':id/profile')
  getProfile(@Param('id') id: string) { return firstValueFrom(this.empService.GetEmployeeProfile({ id })); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Mwangi' },
        email: { type: 'string', example: 'john.mwangi@example.co.tz' },
        phone: { type: 'string', example: '+255712345678' },
        departmentId: { type: 'string', example: 'dept-002' },
        position: { type: 'string', example: 'Senior Software Engineer' },
        salary: { type: 'number', example: 2000000 },
        status: { type: 'string', example: 'active' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.empService.UpdateEmployee({ id, ...body })); }

  @Delete(':id')
  remove(@Param('id') id: string) { return firstValueFrom(this.empService.DeleteEmployee({ id })); }

  @Post(':id/advance-approval')
  advance(@Param('id') id: string) { return firstValueFrom(this.empService.AdvanceApproval({ id })); }

  @Post(':id/approve')
  approve(@Param('id') id: string) { return firstValueFrom(this.empService.ApproveEmployee({ id })); }

  @Post('documents')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'title', 'type', 'fileUrl'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        title: { type: 'string', example: 'National ID' },
        type: { type: 'string', example: 'identification' },
        fileUrl: { type: 'string', example: 'https://storage.example.co.tz/documents/id-001.pdf' },
        expiryDate: { type: 'string', example: '2030-12-31' },
      },
    },
  })
  uploadDoc(@Body() body: any) { return firstValueFrom(this.docService.UploadDocument(body)); }

  @Get('documents/:employeeId')
  listDocs(@Param('employeeId') employeeId: string) { return firstValueFrom(this.docService.ListDocuments({ employeeId })); }

  @Post('qualifications/education')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'institution', 'degree', 'fieldOfStudy', 'startDate'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        institution: { type: 'string', example: 'University of Dar es Salaam' },
        degree: { type: 'string', example: 'Bachelor of Science' },
        fieldOfStudy: { type: 'string', example: 'Computer Science' },
        startDate: { type: 'string', example: '2012-09-01' },
        endDate: { type: 'string', example: '2016-06-30' },
        grade: { type: 'string', example: 'First Class Honours' },
      },
    },
  })
  addEdu(@Body() body: any) { return firstValueFrom(this.qualService.AddEducation(body)); }

  @Post('qualifications/professional')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'name', 'issuingBody', 'issueDate', 'licenseNumber'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        name: { type: 'string', example: 'AWS Certified Solutions Architect' },
        issuingBody: { type: 'string', example: 'Amazon Web Services' },
        issueDate: { type: 'string', example: '2023-03-15' },
        expiryDate: { type: 'string', example: '2026-03-15' },
        licenseNumber: { type: 'string', example: 'AWS-SA-2023-001234' },
      },
    },
  })
  addQual(@Body() body: any) { return firstValueFrom(this.qualService.AddProfessionalQualification(body)); }

  @Get('qualifications/education/:employeeId')
  listEdu(@Param('employeeId') employeeId: string) { return firstValueFrom(this.qualService.ListEducation({ employeeId })); }

  @Get('qualifications/professional/:employeeId')
  listQuals(@Param('employeeId') employeeId: string) { return firstValueFrom(this.qualService.ListQualifications({ employeeId })); }

  @Post('emergency-contacts')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'name', 'relationship', 'phone'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        name: { type: 'string', example: 'Amina Mwangi' },
        relationship: { type: 'string', example: 'Spouse' },
        phone: { type: 'string', example: '+255787654321' },
        email: { type: 'string', example: 'amina.mwangi@example.co.tz' },
        address: { type: 'string', example: '123 Mtaa wa Uhuru, Dar es Salaam' },
      },
    },
  })
  addEC(@Body() body: any) { return firstValueFrom(this.ecService.AddEmergencyContact(body)); }

  @Get('emergency-contacts/:employeeId')
  listEC(@Param('employeeId') employeeId: string) { return firstValueFrom(this.ecService.ListEmergencyContacts({ employeeId })); }

  @Post('family')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'name', 'relationship', 'dateOfBirth'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        name: { type: 'string', example: 'Amina Mwangi' },
        relationship: { type: 'string', example: 'Spouse' },
        dateOfBirth: { type: 'string', example: '1992-08-20' },
        occupation: { type: 'string', example: 'Nurse' },
        phone: { type: 'string', example: '+255787654321' },
      },
    },
  })
  addFam(@Body() body: any) { return firstValueFrom(this.famService.AddFamilyMember(body)); }

  @Get('family/:employeeId')
  listFam(@Param('employeeId') employeeId: string) { return firstValueFrom(this.famService.ListFamily({ employeeId })); }
}
