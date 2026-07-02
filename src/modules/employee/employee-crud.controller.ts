import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { ContractsService } from '../contracts/contracts.service';
import { dropInvalidEmployeeFks } from './employee-fk-guard';
import { toNullableEmployeeDate } from './employee-date.util';
import * as bcrypt from 'bcryptjs';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Employees - CRUD')
@Controller('employees')
export class EmployeeCrudController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly jwt: JwtService,
    private readonly contracts: ContractsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List employees' })
  @RequirePermissions('employees.read')
  async list(@Query() query: any) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.status) where.status = query.status;
    if (query.stage) where.stage = query.stage;

    // Filter by permission: returns only employees whose `role` matches a Role
    // (in the same company OR system role) that has the requested permission.
    // Convention: permission names are `${action}_${feature}` (e.g. `approve_onboarding`).
    if (query.permission) {
      const roleWhere: any = {
        permissions: { some: { permission: { name: String(query.permission) } } },
      };
      if (query.companyId) {
        // include system roles too
        roleWhere.OR = [{ companyId: query.companyId }, { isSystem: true }];
      }
      const matchingRoles = await this.prisma.role.findMany({
        where: roleWhere,
        select: { name: true },
      });
      const roleNames = matchingRoles.map((r) => r.name);
      if (roleNames.length === 0) {
        return { employees: [] };
      }
      where.role = { in: roleNames };
    }

    // Exclude Draft (onboarding-in-progress) unless caller explicitly asks for it
    if (query.excludeDraft === 'true' || query.excludeDraft === true) {
      where.stage = { not: 'Draft' };
    }

    const employees = await this.prisma.employee.findMany({ where, orderBy: { createdAt: 'desc' }, include: { branch: true, department: true, jobTitle: { select: { id: true, name: true } }, grade: { select: { id: true, name: true } }, section: { select: { id: true, name: true } }, businessUnit: { select: { id: true, name: true } }, contractType: { select: { id: true, name: true } } } });
    return { employees };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Employee stats' })
  @RequirePermissions('employees.read')
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
  @RequirePermissions('employees.read')
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
  @RequirePermissions('employees.read')
  async get(@Param('id') id: string) {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @RequirePermissions('employees.write')
  async create(@Body() body: Record<string, any>) {
        // Collect extra fields into metadata
    const extraFields = ['prefix', 'middleName', 'username', 'mobile', 'locale',
      'personalEmail', 'region', 'postalAddress', 'physicalAddress', 'businessUnit',
      'healthInsuranceProvider', 'healthInsuranceOther', 'tradeUnion', 'inductionDate',
      'inductionCompleted', 'termsAndConditions', 'contractFileName', 'profilePhotoName',
      'yearsOfExperience', 'offerLetterDate', 'offerAccepted', 'offerAcceptedDate',
      'candidateSource', 'candidateId', 'employmentId', 'socialSecurityType',
      'socialSecurityNumber', 'tinNumber', 'nidaNumber', 'passportNumber', 'manager',
      'employeeNumber', 'emergencyName', 'emergencyRelationship', 'emergencyPhone'];
    const extraMeta: Record<string, any> = {};
    for (const k of extraFields) {
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
        dateOfBirth: toNullableEmployeeDate(body.dateOfBirth),
        nationality: body.nationality || null,
        branchId: body.branchId || body.branch || null,
        departmentId: body.departmentId || body.department || null,
        sectionId: body.sectionId || body.section || null,
        jobTitleId: body.jobTitleId || null,
        gradeId: body.gradeId || body.grade || null,
        businessUnitId: body.businessUnitId || body.businessUnit || null,
        contractTypeId: body.contractTypeId || body.contractType || null,
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
        metadata: JSON.stringify({ ...(body.metadata ? (typeof body.metadata === 'string' ? JSON.parse(body.metadata) : body.metadata) : {}), ...extraMeta }),
        createdById: body.createdById || null,
    };

    // Drop any invalid FK values (e.g., relation names or stale ids)
    await dropInvalidEmployeeFks(this.prisma, empData);

    const employee = await this.prisma.employee.create({ data: empData });

    // Create user account if email provided
    if (body.email && body.companyId) {
      try {
        const existingUser = await this.prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
        if (!existingUser) {
          const defaultPw = '123456';
          const hashed = await bcrypt.hash(defaultPw, 12);
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
          // Link the reverse side too — every /me resolver reads User.employeeId
          await this.prisma.user.update({ where: { id: user.id }, data: { employeeId: employee.id } });
          // Send welcome email with credentials and confirmation link
          const confirmToken = this.jwt.sign({ sub: user.id, type: 'email_confirm' }, { expiresIn: '48h' });
          const confirmUrl = `${process.env.FRONTEND_URL || 'https://demo.exactehrm.co.tz'}/confirm-email?token=${confirmToken}`;
          const bc = this.email.brandColor;
          this.email.send(body.email, 'Welcome to ExactEHRM — Your Account is Ready', this.email.buildHtml(`
            <h2 style="color:${bc};margin:0 0 16px">Welcome to ExactEHRM!</h2>
            <p>Hi ${body.firstName}, your employee account has been created.</p>
            <p style="margin:16px 0;padding:12px;background:#f9f9f9;border-radius:8px;border:1px solid #eee">
              <strong>Login credentials:</strong><br/>
              Email: <strong>${body.email}</strong><br/>
              Password: <strong>${defaultPw}</strong>
            </p>
            <p>Please confirm your email by clicking the button below:</p>
            <p style="text-align:center;margin:24px 0">
              <a href="${confirmUrl}" style="display:inline-block;background:${bc};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Confirm my account</a>
            </p>
            <p style="color:#888;font-size:13px">This link expires in 48 hours.</p>
          `)).catch(() => {});
        }
      } catch {}
    }

    return employee;
  }

  @Put(':id')
  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  @RequirePermissions('employees.write')
  async update(@Param('id') id: string, @Body() body: Record<string, any>) {
    const data: any = {};
    console.log('[UPDATE] body.role:', body.role, 'body.companyRole:', body.companyRole);

    // Scalar columns that exist on the Employee model — only these are safe
    // to spread into `data`. Anything else gets stashed into metadata below.
    const scalarFields = [
      'firstName', 'lastName', 'email', 'phone', 'gender', 'maritalStatus',
      'dateOfBirth', 'nationality', 'employmentType', 'employmentMode',
      'modeOfPayment', 'joiningDate', 'status', 'stage',
      'contractStartDate', 'contractEndDate', 'probationEndDate',
      'passportNumber', 'createdById', 'profilePhoto', 'employeeNumber',
      'role',
    ];
    for (const f of scalarFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.dateOfBirth !== undefined) {
      data.dateOfBirth = toNullableEmployeeDate(body.dateOfBirth);
    }

    // Foreign-key fields — accept either the *Id form or the relation-name
    // form sent by the onboarding/edit forms.
    if (body.branchId !== undefined || body.branch !== undefined) {
      data.branchId = body.branchId ?? body.branch ?? null;
    }
    if (body.departmentId !== undefined || body.department !== undefined) {
      data.departmentId = body.departmentId ?? body.department ?? null;
    }
    if (body.sectionId !== undefined || body.section !== undefined) {
      data.sectionId = body.sectionId ?? body.section ?? null;
    }
    if (body.jobTitleId !== undefined) data.jobTitleId = body.jobTitleId;
    if (body.gradeId !== undefined || body.grade !== undefined) {
      data.gradeId = body.gradeId ?? body.grade ?? null;
    }
    if (body.businessUnitId !== undefined || body.businessUnit !== undefined) {
      data.businessUnitId = body.businessUnitId ?? body.businessUnit ?? null;
    }
    if (body.contractTypeId !== undefined || body.contractType !== undefined) {
      data.contractTypeId = body.contractTypeId ?? body.contractType ?? null;
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

    // Fields that don't have a dedicated column — merge into metadata JSON.
    const metaFields = [
      'manager', 'employmentId', 'employmentCategory', 'modeOfEmployment',
      'socialSecurityType', 'socialSecurityNumber', 'tinNumber', 'nidaNumber',
      'prefix', 'middleName', 'username', 'mobile', 'locale',
      'personalEmail', 'region', 'postalAddress', 'physicalAddress',
      'healthInsuranceProvider', 'healthInsuranceOther',
      'tradeUnion', 'inductionDate', 'inductionCompleted', 'termsAndConditions',
      'contractFileName', 'profilePhotoName', 'yearsOfExperience',
      'offerLetterDate', 'offerAccepted', 'offerAcceptedDate',
      'candidateSource', 'candidateId', 'emergencyName', 'emergencyRelationship',
      'emergencyPhone',
    ];
    const extraMeta: Record<string, any> = {};
    for (const f of metaFields) {
      if (body[f] !== undefined) extraMeta[f] = body[f];
    }
    if (body.metadata !== undefined || Object.keys(extraMeta).length > 0) {
      const incoming = body.metadata
        ? (typeof body.metadata === 'string' ? JSON.parse(body.metadata) : body.metadata)
        : {};
      // Merge with any existing metadata on the record so partial updates don't drop fields.
      const current = await this.prisma.employee.findUnique({ where: { id }, select: { metadata: true } });
      let currentMeta: Record<string, any> = {};
      if (current?.metadata) {
        try { currentMeta = JSON.parse(current.metadata); } catch { currentMeta = {}; }
      }
      data.metadata = JSON.stringify({ ...currentMeta, ...incoming, ...extraMeta });
    }

    await dropInvalidEmployeeFks(this.prisma, data);

    const previous = await this.prisma.employee.findUnique({ where: { id }, select: { stage: true } });
    const updated = await this.prisma.employee.update({ where: { id }, data });

    // Onboarding hook: when stage transitions into Approved, ensure the
    // employee has a Contract record so the contracts module can take over.
    if (data.stage === 'Approved' && previous?.stage !== 'Approved') {
      try { await this.contracts.ensureContractForEmployee(id); } catch (e) { console.error('[CONTRACT AUTO-CREATE]', e); }
      // After onboarding is approved, ensure the employee has a user account
      // and send a welcome email with credentials (default password: 123456).
      try {
        const emp = await this.prisma.employee.findUnique({ where: { id }, select: { email: true, firstName: true, lastName: true, companyId: true, userId: true } });
        if (emp?.email) {
          let user = null;
          if (!emp.userId) {
            const existingUser = await this.prisma.user.findUnique({ where: { email: emp.email.toLowerCase() } });
            if (!existingUser) {
              const defaultPw = '123456';
              const hashed = await bcrypt.hash(defaultPw, 12);
              user = await this.prisma.user.create({
                data: {
                  email: emp.email.toLowerCase(),
                  password: hashed,
                  firstName: emp.firstName || '',
                  lastName: emp.lastName || '',
                  fullName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                  companyId: emp.companyId || null,
                  role: 'Employee',
                  isActive: true,
                },
              });
              await this.prisma.employee.update({ where: { id }, data: { userId: user.id } });
              await this.prisma.user.update({ where: { id: user.id }, data: { employeeId: id } });
            } else {
              user = existingUser;
              await this.prisma.employee.update({ where: { id }, data: { userId: user.id } });
              // Only set the reverse link if this user isn't already tied to another employee (employeeId is @unique)
              if (!existingUser.employeeId) {
                await this.prisma.user.update({ where: { id: user.id }, data: { employeeId: id } });
              }
            }
          } else {
            user = await this.prisma.user.findUnique({ where: { id: emp.userId } });
            // Backfill the reverse link for already-linked employees whose user still lacks employeeId
            if (user && !user.employeeId) {
              await this.prisma.user.update({ where: { id: user.id }, data: { employeeId: id } });
            }
          }

          if (user) {
            const defaultPw = '123456';
            const confirmToken = this.jwt.sign({ sub: user.id, type: 'email_confirm' }, { expiresIn: '48h' });
            const confirmUrl = `${process.env.FRONTEND_URL || 'https://demo.exactehrm.co.tz'}/confirm-email?token=${confirmToken}`;
            const bc = this.email.brandColor;
            this.email.send(emp.email, 'Welcome to ExactEHRM — Your Account is Ready', this.email.buildHtml(`
              <h2 style="color:${bc};margin:0 0 16px">Welcome to ExactEHRM!</h2>
              <p>Hi ${emp.firstName || ''}, your employee account has been created and is ready.</p>
              <p style="margin:16px 0;padding:12px;background:#f9f9f9;border-radius:8px;border:1px solid #eee">
                <strong>Login credentials:</strong><br/>
                Email: <strong>${user.email}</strong><br/>
                Password: <strong>${defaultPw}</strong>
              </p>
              <p>Please confirm your email by clicking the button below:</p>
              <p style="text-align:center;margin:24px 0">
                <a href="${confirmUrl}" style="display:inline-block;background:${bc};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Confirm my account</a>
              </p>
              <p style="color:#888;font-size:13px">This link expires in 48 hours.</p>
            `)).catch(() => {});
          }
        }
      } catch (e) {
        console.error('[ONBOARDING EMAIL]', e);
      }
    }

    return updated;
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
  @RequirePermissions('employees.delete')
  async delete(@Param('id') id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }
}
