import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import * as bcrypt from 'bcryptjs';

@ApiTags('Employees - CRUD')
@Controller('employees')
export class EmployeeCrudController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List employees' })
  async list(@Query() query: any) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.status) where.status = query.status;
    if (query.stage) where.stage = query.stage;
    const employees = await this.prisma.employee.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { employees };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Employee stats' })
  async stats(@Query('companyId') companyId: string) {
    const where = companyId ? { companyId } : {};
    const [total, active, draft, onboarding] = await Promise.all([
      this.prisma.employee.count({ where }),
      this.prisma.employee.count({ where: { ...where, status: 'Active' } }),
      this.prisma.employee.count({ where: { ...where, stage: 'Draft' } }),
      this.prisma.employee.count({ where: { ...where, stage: { not: 'Approved' }, status: { not: 'Active' } } }),
    ]);
    return { total, active, draft, onboarding };
  }

  @Get('signals')
  @ApiOperation({ summary: 'AI signals based on employee data' })
  async getSignals(@Query('companyId') companyId: string) {
    const where = companyId ? { companyId } : {};
    const employees = await this.prisma.employee.findMany({ where });

    const signals: any[] = [];
    const now = new Date();

    // Onboarding bottleneck — check employees stuck in Documentation/Induction > 14 days
    const stuck = employees.filter((e) => {
      if (!e.joiningDate || e.stage === 'Approved' || e.stage === 'Draft') return false;
      const joined = new Date(e.joiningDate);
      const days = Math.floor((now.getTime() - joined.getTime()) / 86400000);
      return days > 14 && (e.stage === 'Documentation' || e.stage === 'Induction');
    });
    if (stuck.length > 0) {
      const avgDays = Math.round(stuck.reduce((sum, e) => {
        return sum + Math.floor((now.getTime() - new Date(e.joiningDate).getTime()) / 86400000);
      }, 0) / stuck.length);
      signals.push({
        id: 'sig-onb-bottleneck',
        signal: 'Onboarding bottleneck',
        entity: `${stuck.length} employee(s) stuck in ${stuck[0]?.stage || 'onboarding'} (avg ${avgDays} days)`,
        confidence: Math.min(95, 70 + stuck.length * 5),
        action: 'Review onboarding workflow',
      });
    }

    // Doc compliance — check employees missing checklist items
    const missingDocs = employees.filter((e) => {
      if (!e.checklist) return false;
      try {
        const cl = JSON.parse(e.checklist);
        return Object.values(cl).some((v: any) => v?.requiresUpload !== false && !v?.fileName);
      } catch { return false; }
    });
    if (missingDocs.length > 0) {
      signals.push({
        id: 'sig-doc-gap',
        signal: 'Doc compliance gap',
        entity: `${missingDocs.length} employee(s) missing required documents`,
        confidence: Math.min(90, 65 + missingDocs.length * 5),
        action: 'Send reminders',
      });
    }

    // Pending approvals
    const pendingApproval = employees.filter((e) => e.stage === 'Pending Approval');
    if (pendingApproval.length > 0) {
      signals.push({
        id: 'sig-pending-approval',
        signal: 'Pending approvals',
        entity: `${pendingApproval.length} employee(s) waiting for approval`,
        confidence: 85,
        action: 'Review approval queue',
      });
    }

    // Expired probation
    const expiredProbation = employees.filter((e) => {
      if (!e.probationEndDate || e.stage === 'Approved') return false;
      return new Date(e.probationEndDate) < now;
    });
    if (expiredProbation.length > 0) {
      signals.push({
        id: 'sig-probation-expired',
        signal: 'Probation review overdue',
        entity: `${expiredProbation.length} employee(s) past probation end date`,
        confidence: 88,
        action: 'Schedule review',
      });
    }

    // Inductions not scheduled
    const noInduction = employees.filter((e) => {
      if (e.stage === 'Approved' || e.stage === 'Draft') return false;
      if (e.metadata) {
        try { const m = JSON.parse(e.metadata); if (m.inductionDate) return false; } catch {}
      }
      return true;
    });
    if (noInduction.length > 0) {
      signals.push({
        id: 'sig-no-induction',
        signal: 'Induction not scheduled',
        entity: `${noInduction.length} employee(s) without induction date`,
        confidence: 75,
        action: 'Schedule induction',
      });
    }

    return { signals };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async get(@Param('id') id: string) {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  async create(@Body() body: any) {
        // Collect extra fields into metadata
    const extraFields = ['companyRoles', 'role', 'prefix', 'middleName', 'username', 'mobile', 'locale',
      'personalEmail', 'region', 'postalAddress', 'physicalAddress', 'businessUnit',
      'healthInsuranceProvider', 'healthInsuranceOther', 'tradeUnion', 'inductionDate',
      'inductionCompleted', 'termsAndConditions', 'contractFileName', 'profilePhotoName',
      'yearsOfExperience', 'offerLetterDate', 'offerAccepted', 'offerAcceptedDate',
      'candidateSource', 'candidateId', 'employmentId', 'socialSecurityType',
      'socialSecurityNumber', 'tinNumber', 'nidaNumber', 'passportNumber', 'manager',
      'employeeNumber'];
    const extraMeta: Record<string, any> = {};
    for (const k of extraFields) {
      if (body[k] !== undefined) extraMeta[k] = body[k];
    }

    const employee = await this.prisma.employee.create({
      data: {
        companyId: body.companyId || '',
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        fullName: body.fullName || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
        email: body.email || null,
        phone: body.phone || null,
        gender: body.gender || null,
        maritalStatus: body.maritalStatus || null,
        dateOfBirth: body.dateOfBirth || null,
        nationality: body.nationality || null,
        branchId: body.branchId || body.branch || null,
        departmentId: body.departmentId || body.department || null,
        section: body.section || null,
        jobTitle: body.jobTitle || null,
        employeeNumber: body.employeeNumber || body.employmentId || null,
        employmentMode: body.employmentMode || body.employmentType || null,
        employmentType: body.employmentType || null,
        modeOfPayment: body.modeOfPayment || null,
        joiningDate: body.joiningDate || null,
        status: body.status || 'Draft',
        gross: body.gross ? Number(body.gross) : null,
        contractType: body.contractType || null,
        contractStartDate: body.contractStartDate || null,
        contractEndDate: body.contractEndDate || null,
        probationEndDate: body.probationEndDate || null,
        stage: body.stage || 'Draft',
        approvalStage: body.approvalStage || 0,
        checklist: body.checklist ? JSON.stringify(body.checklist) : null,
        complianceStatus: body.complianceStatus ? JSON.stringify(body.complianceStatus) : null,
        documents: body.documents ? JSON.stringify(body.documents) : null,
        education: body.education ? JSON.stringify(body.education) : null,
        qualifications: body.qualifications ? JSON.stringify(body.qualifications) : null,
        skills: body.skills ? JSON.stringify(body.skills) : null,
        languages: body.languages ? JSON.stringify(body.languages) : null,
        emergencyContacts: body.emergencyContacts ? JSON.stringify(body.emergencyContacts) : null,
        family: body.family ? JSON.stringify(body.family) : null,
        metadata: JSON.stringify({ ...(body.metadata ? (typeof body.metadata === 'string' ? JSON.parse(body.metadata) : body.metadata) : {}), ...extraMeta }),
        createdById: body.createdById || null,
      },
    });

    // Create user account if email provided
    if (body.email && body.companyId) {
      try {
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
              role: 'Employee',
              isActive: true,
            },
          });
          await this.prisma.employee.update({ where: { id: employee.id }, data: { userId: user.id } });
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
      'firstName', 'lastName', 'email', 'phone', 'gender', 'maritalStatus',
      'dateOfBirth', 'nationality', 'branchId', 'departmentId', 'section', 'jobTitle',
      'manager', 'employmentId', 'employmentCategory', 'employmentType',
      'modeOfEmployment', 'modeOfPayment', 'joiningDate', 'status', 'stage',
      'contractType', 'contractStartDate', 'contractEndDate', 'probationEndDate',
      'socialSecurityType', 'socialSecurityNumber', 'tinNumber', 'nidaNumber',
      'passportNumber', 'createdById',
      'prefix', 'middleName', 'username', 'mobile', 'locale',
      'personalEmail', 'region', 'postalAddress', 'physicalAddress',
      'businessUnit', 'healthInsuranceProvider', 'healthInsuranceOther',
      'tradeUnion', 'inductionDate', 'termsAndConditions', 'contractFileName',
      'profilePhotoName', 'yearsOfExperience', 'offerLetterDate',
      'offerAcceptedDate', 'candidateSource', 'candidateId',
    ];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.inductionCompleted !== undefined) data.inductionCompleted = body.inductionCompleted;
    if (body.offerAccepted !== undefined) data.offerAccepted = body.offerAccepted;
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
              url: `/uploads/${v.fileName}`,
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
              url: d.url || `/uploads/${d.fileName || d.name}`,
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
      url: body.url || `/uploads/${fileName}`,
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
