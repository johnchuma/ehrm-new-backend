import { Controller, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ContractsService } from '../contracts/contracts.service';
import { EmailService } from '../notifications/email.service';
import { dropInvalidEmployeeFks } from './employee-fk-guard';
import { toNullableEmployeeDate } from './employee-date.util';
import * as bcrypt from 'bcryptjs';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('employees')
export class EmployeePatchController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contracts: ContractsService,
    private readonly email: EmailService,
    private readonly jwt: JwtService,
  ) {}

  private normalizeEmail(value?: string | null) {
    return String(value || '').trim().toLowerCase();
  }

  private generateInitialPassword() {
    return Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6);
  }

  private async ensureOnboardingUserAccount(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        companyId: true,
        userId: true,
      },
    });
    const workEmail = this.normalizeEmail(employee?.email);
    if (!employee || !workEmail) return;

    let initialPassword = '';
    let user = employee.userId
      ? await this.prisma.user.findUnique({ where: { id: employee.userId } })
      : null;

    if (!user) {
      const existingUser = await this.prisma.user.findUnique({ where: { email: workEmail } });
      if (existingUser) {
        const shouldIssueInitialPassword = !existingUser.emailVerified && !existingUser.lastLoginAt;
        initialPassword = shouldIssueInitialPassword ? this.generateInitialPassword() : '';
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            employeeId: existingUser.employeeId || employee.id,
            companyId: existingUser.companyId || employee.companyId || null,
            firstName: existingUser.firstName || employee.firstName || '',
            lastName: existingUser.lastName || employee.lastName || '',
            fullName: existingUser.fullName || employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || workEmail,
            ...(shouldIssueInitialPassword
              ? {
                  password: await bcrypt.hash(initialPassword, 12),
                  isActive: false,
                  emailVerified: false,
                }
              : {}),
          },
        });
      } else {
        initialPassword = this.generateInitialPassword();
        const hashed = await bcrypt.hash(initialPassword, 12);
        user = await this.prisma.user.create({
          data: {
            email: workEmail,
            password: hashed,
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            fullName: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || workEmail,
            companyId: employee.companyId || null,
            employeeId: employee.id,
            role: 'Employee',
            isActive: false,
            emailVerified: false,
          },
        });
      }
      await this.prisma.employee.update({ where: { id: employee.id }, data: { userId: user.id } });
    } else if (!user.emailVerified && !user.lastLoginAt) {
      initialPassword = this.generateInitialPassword();
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: await bcrypt.hash(initialPassword, 12),
          email: user.email || workEmail,
          companyId: user.companyId || employee.companyId || null,
          isActive: false,
          emailVerified: false,
        },
      });
    }

    const confirmToken = this.jwt.sign({ sub: user.id, type: 'email_confirm' }, { expiresIn: '48h' });
    const confirmUrl = `${process.env.FRONTEND_URL || 'https://test.exactehrm.co.tz'}/confirm-email?token=${confirmToken}`;
    const bc = this.email.brandColor;
    const passwordBlock = initialPassword
      ? `
        <p style="margin:16px 0;padding:12px;background:#f9f9f9;border-radius:8px;border:1px solid #eee">
          <strong>Initial login credentials:</strong><br/>
          Email: <strong>${workEmail}</strong><br/>
          Password: <strong>${initialPassword}</strong>
        </p>
        <p>Use this password after activating your account. You can change it after logging in.</p>
      `
      : `
        <p style="margin:16px 0;padding:12px;background:#f9f9f9;border-radius:8px;border:1px solid #eee">
          Email: <strong>${workEmail}</strong>
        </p>
        <p>Your account already exists, so your current password has not been changed.</p>
      `;

    await this.email.send(workEmail, 'Activate your ExactEHRM account', this.email.buildHtml(`
      <h2 style="color:${bc};margin:0 0 16px">Welcome to ExactEHRM!</h2>
      <p>Hi ${employee.firstName || employee.fullName || 'there'}, your employee account has been prepared.</p>
      ${passwordBlock}
      <p>Please activate and verify your account by clicking the button below:</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${confirmUrl}" style="display:inline-block;background:${bc};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Activate my account</a>
      </p>
      <p style="color:#888;font-size:13px">This activation link expires in 48 hours.</p>
    `));
  }

  private async resolveRelationId(
    model:
      | 'branch'
      | 'department'
      | 'section'
      | 'jobTitle'
      | 'grade'
      | 'businessUnit'
      | 'contractType',
    companyId: string,
    value: any,
  ) {
    if (!value) return null;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const table = (this.prisma as any)[model];
    if (!table?.findMany) return value;

    const normalized = trimmed.toLowerCase();
    const found = await table
      .findMany({
        where: { companyId },
        select: { id: true, name: true, code: true },
      })
      .then((rows: Array<{ id: string; name?: string | null; code?: string | null }>) =>
        rows.find(
          (row) =>
            row.id === trimmed ||
            String(row.name || '').trim().toLowerCase() === normalized ||
            String(row.code || '').trim().toLowerCase() === normalized,
        ) || null,
      )
      .catch(() => null);

    return found?.id || value;
  }

  @Patch(':id/onboarding')
  @Patch(':id')
  @RequirePermissions('employees.write')
  async patch(@Param('id') id: string, @Body() body: Record<string, any>) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new NotFoundException('Employee not found');

    const data: any = {};
    const extraFields = [
      'prefix', 'middleName', 'username', 'mobile', 'locale', 'personalEmail',
      'region', 'postalAddress', 'physicalAddress', 'businessUnit',
      'healthInsuranceProvider', 'healthInsuranceOther', 'tradeUnion',
      'inductionDate', 'inductionCompleted', 'termsAndConditions',
      'contractFileName', 'profilePhotoName', 'yearsOfExperience',
      'offerLetterDate', 'offerAccepted', 'offerAcceptedDate',
      'candidateSource', 'candidateId', 'employmentId', 'employmentCategory',
      'modeOfEmployment', 'socialSecurityType', 'socialSecurityNumber',
      'tinNumber', 'nidaNumber', 'passportNumber', 'manager', 'employeeNumber',
      'emergencyName', 'emergencyRelationship', 'emergencyPhone',
    ];
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'gender', 'maritalStatus',
      'dateOfBirth', 'nationality', 'branchId', 'departmentId', 'sectionId', 'jobTitleId',
      'gradeId', 'businessUnitId', 'contractTypeId', 'managerId', 'employeeNumber',
      'employmentType', 'employmentMode', 'modeOfPayment', 'joiningDate', 'status', 'stage', 'profilePhoto',
      'contractStartDate', 'contractEndDate', 'probationEndDate', 'role',
    ];
    if (body.manager !== undefined && body.managerId === undefined) data.managerId = body.manager || null;
    // Map relation-name aliases sent by onboarding/edit forms to actual FK columns.
    if (body.branch !== undefined && body.branchId === undefined) data.branchId = await this.resolveRelationId('branch', emp.companyId, body.branch);
    if (body.department !== undefined && body.departmentId === undefined) data.departmentId = await this.resolveRelationId('department', emp.companyId, body.department);
    if (body.section !== undefined && body.sectionId === undefined) data.sectionId = await this.resolveRelationId('section', emp.companyId, body.section);
    if (body.jobTitle !== undefined && body.jobTitleId === undefined) data.jobTitleId = await this.resolveRelationId('jobTitle', emp.companyId, body.jobTitle);
    if (body.grade !== undefined && body.gradeId === undefined) data.gradeId = await this.resolveRelationId('grade', emp.companyId, body.grade);
    if (body.businessUnit !== undefined && body.businessUnitId === undefined) data.businessUnitId = await this.resolveRelationId('businessUnit', emp.companyId, body.businessUnit);
    if (body.contractType !== undefined && body.contractTypeId === undefined) data.contractTypeId = await this.resolveRelationId('contractType', emp.companyId, body.contractType);
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.dateOfBirth !== undefined) {
      data.dateOfBirth = toNullableEmployeeDate(body.dateOfBirth);
    }
    if (body.profilePhotoName !== undefined && body.profilePhoto === undefined) {
      data.profilePhoto = body.profilePhotoName || null;
    }
    if (body.gross !== undefined) data.gross = Number(body.gross);
    if (body.approvalStage !== undefined) data.approvalStage = Number(body.approvalStage);
    if (body.checklist !== undefined) data.checklist = JSON.stringify(body.checklist);
    if (body.complianceStatus !== undefined) data.complianceStatus = JSON.stringify(body.complianceStatus);
    if (body.documents !== undefined) data.documents = JSON.stringify(body.documents);
    const currentMetadata = emp.metadata
      ? (() => {
          try {
            return JSON.parse(emp.metadata as any);
          } catch {
            return {};
          }
        })()
      : {};
    const incomingMetadata = body.metadata && typeof body.metadata === 'object'
      ? body.metadata
      : {};
    const mergedMetadata: Record<string, any> = { ...currentMetadata, ...incomingMetadata };
    for (const key of extraFields) {
      if (body[key] !== undefined) mergedMetadata[key] = body[key];
    }
    if (Object.keys(mergedMetadata).length > 0) {
      data.metadata = JSON.stringify(mergedMetadata);
    }

    await dropInvalidEmployeeFks(this.prisma, data);

    const previousStage = emp.stage;
    const updated = await this.prisma.employee.update({ where: { id }, data });

    if (data.stage === 'Approved' && previousStage !== 'Approved') {
      try { await this.contracts.ensureContractForEmployee(id); } catch (e) { console.error('[CONTRACT AUTO-CREATE]', e); }
      try { await this.ensureOnboardingUserAccount(id); } catch (e) { console.error('[ONBOARDING ACCOUNT EMAIL]', e); }
    }

    return updated;
  }
}
