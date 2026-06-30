import { Controller, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ContractsService } from '../contracts/contracts.service';
import { dropInvalidEmployeeFks } from './employee-fk-guard';
import { toNullableEmployeeDate } from './employee-date.util';

@Controller('employees')
export class EmployeePatchController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contracts: ContractsService,
  ) {}

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
    }

    return updated;
  }
}
