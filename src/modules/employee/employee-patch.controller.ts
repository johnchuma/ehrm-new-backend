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
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'gender', 'maritalStatus',
      'dateOfBirth', 'nationality', 'branchId', 'departmentId', 'sectionId', 'jobTitleId',
      'gradeId', 'businessUnitId', 'contractTypeId', 'managerId', 'employeeNumber',
      'employmentType', 'employmentMode', 'modeOfPayment', 'joiningDate', 'status', 'stage',
    ];
    if (body.manager !== undefined && body.managerId === undefined) data.managerId = body.manager || null;
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.gross !== undefined) data.gross = Number(body.gross);
    if (body.approvalStage !== undefined) data.approvalStage = body.approvalStage;
    if (body.checklist !== undefined) data.checklist = JSON.stringify(body.checklist);
    if (body.documents !== undefined) data.documents = JSON.stringify(body.documents);

    return this.prisma.employee.update({ where: { id }, data });
  }
}
