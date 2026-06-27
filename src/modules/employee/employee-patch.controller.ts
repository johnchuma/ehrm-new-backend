import { Controller, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('employees')
export class EmployeePatchController {
  constructor(private readonly prisma: PrismaService) {}

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
    ];
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'gender', 'maritalStatus',
      'dateOfBirth', 'nationality', 'branchId', 'departmentId', 'sectionId', 'jobTitleId',
      'gradeId', 'businessUnitId', 'contractTypeId', 'managerId', 'employeeNumber',
      'employmentType', 'employmentMode', 'modeOfPayment', 'joiningDate', 'status', 'stage', 'profilePhoto',
    ];
    if (body.manager !== undefined && body.managerId === undefined) data.managerId = body.manager || null;
    // Map relation-name aliases sent by onboarding/edit forms to actual FK columns.
    if (body.branch !== undefined && body.branchId === undefined) data.branchId = body.branch || null;
    if (body.department !== undefined && body.departmentId === undefined) data.departmentId = body.department || null;
    if (body.section !== undefined && body.sectionId === undefined) data.sectionId = body.section || null;
    if (body.jobTitle !== undefined && body.jobTitleId === undefined) data.jobTitleId = body.jobTitle || null;
    if (body.grade !== undefined && body.gradeId === undefined) data.gradeId = body.grade || null;
    if (body.businessUnit !== undefined && body.businessUnitId === undefined) data.businessUnitId = body.businessUnit || null;
    if (body.contractType !== undefined && body.contractTypeId === undefined) data.contractTypeId = body.contractType || null;
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.profilePhotoName !== undefined && body.profilePhoto === undefined) {
      data.profilePhoto = body.profilePhotoName || null;
    }
    if (body.gross !== undefined) data.gross = Number(body.gross);
    if (body.approvalStage !== undefined) data.approvalStage = body.approvalStage;
    if (body.checklist !== undefined) data.checklist = JSON.stringify(body.checklist);
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

    return this.prisma.employee.update({ where: { id }, data });
  }
}
