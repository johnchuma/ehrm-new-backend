import { Controller, Get, Put, Body, UseGuards, NotFoundException, Delete, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeService, UpdateProfileDto } from './employee.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

function fileUrl(filename: string): string {
  return `/uploads/${filename}`;
}

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
  email: any;
  constructor(
    private readonly svc: EmployeeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my employee profile' })
  getMyProfile(@CurrentUser() user: any) {
    return this.svc.getMyProfile(user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update my employee profile (self-service fields only)' })
  updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.svc.updateMyProfile(user.sub, dto);
  }

  @Get('me/documents')
  @ApiOperation({ summary: 'Get my documents' })
  getMyDocuments(@CurrentUser() user: any) {
    return this.svc.getMyDocuments(user.sub);
  }

  @Get('me/direct-reports')
  @ApiOperation({ summary: 'Get my direct reports (manager view)' })
  getDirectReports(@CurrentUser() user: any) {
    return this.svc.getDirectReports(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  async create(@Body() body: any) {
    const extraMeta: any = {};
    for (const k of ['prefix', 'middleName', 'username', 'mobile', 'locale', 'personalEmail',
      'region', 'postalAddress', 'physicalAddress', 'businessUnit',
      'healthInsuranceProvider', 'healthInsuranceOther', 'tradeUnion',
      'inductionDate', 'inductionCompleted', 'termsAndConditions',
      'contractFileName', 'profilePhotoName', 'yearsOfExperience',
      'offerLetterDate', 'offerAccepted', 'offerAcceptedDate',
      'candidateSource', 'candidateId', 'employmentCategory',
      'modeOfEmployment', 'socialSecurityType', 'socialSecurityNumber',
      'tinNumber', 'nidaNumber', 'passportNumber', 'manager',
      'employmentId', 'employeeNumber']) {
      if (body[k] !== undefined) extraMeta[k] = body[k];
    }

    const empData: any = {
      companyId: body.companyId || '',
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      fullName: body.fullName || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      email: body.email || null,
      phone: body.phone || null,
      gender: body.gender || null,
      maritalStatus: body.maritalStatus || null,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      nationality: body.nationality || null,
      branchId: body.branchId || body.branch || null,
      departmentId: body.departmentId || body.department || null,
      sectionId: body.sectionId || body.section || null,
      jobTitleId: body.jobTitleId || null,
      gradeId: body.gradeId || body.grade || null,
      businessUnitId: body.businessUnitId || body.businessUnit || null,
      contractTypeId: body.contractTypeId || body.contractType || null,
      modeOfPayment: body.modeOfPayment || null,
      joiningDate: body.joiningDate || null,
      status: body.status || 'Draft',
      gross: body.gross ? Number(body.gross) : null,
      contractStartDate: body.contractStartDate || null,
      contractEndDate: body.contractEndDate || null,
      probationEndDate: body.probationEndDate || null,
      stage: body.stage || 'Draft',
      approvalStage: body.approvalStage || 0,
      role: body.role || body.companyRole || null,
      checklist: body.checklist ? JSON.stringify(body.checklist) : null,
      complianceStatus: body.complianceStatus ? JSON.stringify(body.complianceStatus) : null,
      documents: body.documents ? JSON.stringify(body.documents) : null,
      education: body.education ? JSON.stringify(body.education) : null,
      qualifications: body.qualifications ? JSON.stringify(body.qualifications) : null,
      skills: body.skills ? JSON.stringify(body.skills) : null,
      languages: body.languages ? JSON.stringify(body.languages) : null,
      emergencyContacts: body.emergencyContacts ? JSON.stringify(body.emergencyContacts) : null,
      family: body.family ? JSON.stringify(body.family) : null,
      metadata: Object.keys(extraMeta).length ? JSON.stringify(extraMeta) : null,
      createdById: body.createdById || null,
    };
    const employee = await this.prisma.employee.create({ data: empData });

    // Create user account if email provided
    if (body.email && body.companyId) {
      try {
        const empRole = await this.prisma.role.findFirst({ where: { name: 'Employee', isSystem: true } });
        const existingUser = await this.prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
        if (!existingUser) {
          const hashed = await bcrypt.hash(body.password || 'employee123', 12);
          const user = await this.prisma.user.create({
            data: {
              email: body.email.toLowerCase(),
              password: hashed,
              firstName: body.firstName || '',
              lastName: body.lastName || '',
              fullName: `${body.firstName || ''} ${body.lastName || ''}`.trim(),
              companyId: body.companyId,
              isActive: true,
            },
          });
          await this.prisma.employee.update({ where: { id: employee.id }, data: { userId: user.id } });
          if (empRole) {
            await this.prisma.userRole.create({ data: { userId: user.id, roleId: empRole.id } }).catch(() => {});
          }
          // Send welcome email
          this.email.send(body.email, 'Welcome to ExactEHRM', this.email.buildHtml(`
            <h2>Welcome to ExactEHRM!</h2>
            <p>Hi ${body.firstName}, your employee account has been created.</p>
            <p>Your login email is: <strong>${body.email}</strong></p>
            <p>You can sign in and access your employee portal.</p>
          `)).catch(() => {});
        }
      } catch {}
    }

    return employee;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'gender', 'nationality',
      'maritalStatus', 'address', 'city', 'jobTitle', 'grade', 'status',
      'branchId', 'departmentId', 'managerId', 'employeeNumber',
      'jobTitleId', 'gradeId', 'sectionId', 'businessUnitId', 'contractTypeId',
      'employmentType', 'employmentMode', 'startDate', 'endDate',
      'basicSalary', 'currency', 'gross', 'section', 'stage', 'approvalStage',
      'joiningDate', 'contractType', 'contractStartDate', 'contractEndDate',
      'probationEndDate', 'modeOfPayment', 'profilePhoto',
      'bankName', 'bankAccount', 'bankBranch', 'mobileMoney', 'mobileMoneyName',
      'emergencyName', 'emergencyPhone', 'emergencyRelation',
      'dateOfBirth', 'nationalId', 'tin', 'nssfNumber', 'passportNumber',
      'role',
    ];
    if (body.role !== undefined) data.role = body.role;
    if (body.section !== undefined && body.sectionId === undefined) data.sectionId = body.section;
    if (body.jobTitle !== undefined && body.jobTitleId === undefined) data.jobTitleId = body.jobTitle;
    if (body.grade !== undefined && body.gradeId === undefined) data.gradeId = body.grade;
    if (body.businessUnit !== undefined && body.businessUnitId === undefined) data.businessUnitId = body.businessUnit;
    if (body.contractType !== undefined && body.contractTypeId === undefined) data.contractTypeId = body.contractType;
    if (body.branch !== undefined && body.branchId === undefined) data.branchId = body.branch;
    if (body.department !== undefined && body.departmentId === undefined) data.departmentId = body.department;
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.firstName !== undefined || body.lastName !== undefined) {
      const current = await this.prisma.employee.findUnique({ where: { id } });
      data.fullName = `${body.firstName ?? current?.firstName ?? ''} ${body.lastName ?? current?.lastName ?? ''}`.trim();
    }
    if (body.gross !== undefined) data.gross = Number(body.gross);
    if (body.approvalStage !== undefined) data.approvalStage = body.approvalStage;
    if (body.checklist !== undefined) data.checklist = JSON.stringify(body.checklist);
    if (body.complianceStatus !== undefined) data.complianceStatus = JSON.stringify(body.complianceStatus);
    if (body.documents !== undefined) data.documents = JSON.stringify(body.documents);
    if (body.education !== undefined) data.education = JSON.stringify(body.education);
    if (body.qualifications !== undefined) data.qualifications = JSON.stringify(body.qualifications);
    if (body.skills !== undefined) data.skills = JSON.stringify(body.skills);
    if (body.languages !== undefined) data.languages = JSON.stringify(body.languages);
    if (body.emergencyContacts !== undefined) data.emergencyContacts = JSON.stringify(body.emergencyContacts);
    if (body.family !== undefined) data.family = JSON.stringify(body.family);
    if (body.metadata !== undefined) data.metadata = JSON.stringify(body.metadata);
    return this.prisma.employee.update({ where: { id }, data });
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get all documents for an employee (checklist files + uploaded docs)' })
  async getDocuments(@Param('id') id: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new NotFoundException('Employee not found');

    const docs: any[] = [];

    // Collect files from checklist items
    if (emp.checklist) {
      try {
        const cl: Record<string, any> = JSON.parse(emp.checklist);
        for (const [key, val] of Object.entries(cl)) {
          const v = val as any;
          if (v?.fileName) {
            docs.push({
              id: `${key}-${id}`,
              category: 'Checklist',
              name: v.fileName,
              type: key,
              label: key,
              uploadedAt: emp.updatedAt,
              url: fileUrl(v.fileName),
            });
          }
        }
      } catch {}
    }

    // Collect uploaded documents array
    if (emp.documents) {
      try {
        const uploaded: any[] = JSON.parse(emp.documents);
        if (Array.isArray(uploaded)) {
          for (const doc of uploaded) {
            const d = doc as any;
            docs.push({
              id: d.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              category: d.category || 'Other',
              name: d.fileName || d.name || '',
              type: d.type || '',
              label: d.label || d.name || '',
              uploadedAt: d.uploadedAt || emp.updatedAt,
              url: d.url || fileUrl(d.fileName || d.name),
            });
          }
        }
      } catch {}
    }

    return { documents: docs };
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Add a document record to employee' })
  async addDocument(@Param('id') id: string, @Body() body: Record<string, any>) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new NotFoundException('Employee not found');

    let docs: any[] = [];
    if (emp.documents) {
      try { docs = JSON.parse(emp.documents); } catch {}
    }
    if (!Array.isArray(docs)) docs = [];

    const fileName = body.fileName || body.name || '';
    const newDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fileName,
      name: body.name || fileName,
      category: body.category || 'Other',
      type: body.type || '',
      label: body.label || body.name || fileName,
      uploadedAt: new Date().toISOString(),
      url: body.url || fileUrl(fileName),
    };
    docs.push(newDoc);

    await this.prisma.employee.update({ where: { id }, data: { documents: JSON.stringify(docs) } });
    return newDoc;
  }

  @Delete(':id/documents/:docId')
  @ApiOperation({ summary: 'Delete a document from employee record' })
  async deleteDocument(@Param('id') id: string, @Param('docId') docId: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new NotFoundException('Employee not found');

    let docs: any[] = [];
    if (emp.documents) {
      try { docs = JSON.parse(emp.documents); } catch {}
    }
    if (!Array.isArray(docs)) docs = [];

    docs = docs.filter((d: any) => d.id !== docId);
    await this.prisma.employee.update({ where: { id }, data: { documents: JSON.stringify(docs) } });
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  async delete(@Param('id') id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }
}
