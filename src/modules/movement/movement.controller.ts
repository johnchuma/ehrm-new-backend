import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Movements')
@Controller('movements')
export class MovementController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List movements (filter by companyId, type, status)' })
  @RequirePermissions('employees.read')
  async list(@Query() query: any) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.movementType) where.movementType = query.movementType;
    if (query.status) where.status = query.status;
    if (query.employeeId) where.employeeId = query.employeeId;
    const movements = await this.prisma.employeeMovement.findMany({ where, orderBy: { createdAt: 'desc' } });
    return { movements };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Movement stats' })
  @RequirePermissions('employees.read')
  async stats(@Query('companyId') companyId: string) {
    const where = companyId ? { companyId } : {};
    const [total, promotions, transfers, salaryChanges, acting, reassignments] = await Promise.all([
      this.prisma.employeeMovement.count({ where }),
      this.prisma.employeeMovement.count({ where: { ...where, movementType: 'Promotion' } }),
      this.prisma.employeeMovement.count({ where: { ...where, movementType: 'Transfer' } }),
      this.prisma.employeeMovement.count({ where: { ...where, movementType: 'Salary Change' } }),
      this.prisma.employeeMovement.count({ where: { ...where, movementType: 'Acting Appointment' } }),
      this.prisma.employeeMovement.count({ where: { ...where, movementType: 'Reassignment' } }),
    ]);
    return { total, promotions, transfers, salaryChanges, acting, reassignments };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movement by ID' })
  @RequirePermissions('employees.read')
  async get(@Param('id') id: string) {
    return this.prisma.employeeMovement.findUnique({ where: { id } });
  }

  @Post()
  @ApiOperation({ summary: 'Create movement record' })
  @RequirePermissions('employees.write')
  async create(@Body() body: any) {
    return this.prisma.employeeMovement.create({
      data: {
        companyId: body.companyId || '',
        employeeId: body.employeeId || '',
        employeeName: body.employeeName || null,
        movementType: body.movementType || 'Transfer',
        fromValue: body.fromValue || null,
        toValue: body.toValue || null,
        reason: body.reason || null,
        effectiveDate: body.effectiveDate || null,
        status: body.status || 'Pending',
        approvedBy: body.approvedBy || null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
        createdById: body.createdById || null,
      },
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update movement record' })
  @RequirePermissions('employees.write')
  async update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    const fields = ['employeeId', 'employeeName', 'movementType', 'fromValue', 'toValue', 'reason', 'effectiveDate', 'status', 'approvedBy'];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.metadata !== undefined) data.metadata = JSON.stringify(body.metadata);
    if (body.status === 'Approved' && !body.approvedBy) data.approvedAt = new Date();
    return this.prisma.employeeMovement.update({ where: { id }, data });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete movement record' })
  @RequirePermissions('employees.delete')
  async delete(@Param('id') id: string) {
    return this.prisma.employeeMovement.delete({ where: { id } });
  }
}
