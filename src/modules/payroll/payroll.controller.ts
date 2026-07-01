import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PayrollService, RequestAdvanceDto } from './payroll.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly svc: PayrollService) {}

  @Get('me/payslips')
  @ApiOperation({ summary: 'Get my payslips' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getMyPayslips(@CurrentUser() user: any, @Query('year') year?: string) {
    return this.svc.getMyPayslips(user.sub, year ? parseInt(year) : undefined);
  }

  @Get('me/payslips/:id')
  @ApiOperation({ summary: 'Get payslip detail' })
  getPayslipById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.getPayslipById(user.sub, id);
  }

  @Get('me/advances')
  @ApiOperation({ summary: 'Get my salary advance history' })
  getMyAdvances(@CurrentUser() user: any) {
    return this.svc.getMyAdvances(user.sub);
  }

  @Post('me/advances')
  @HttpCode(201)
  @ApiOperation({ summary: 'Request a salary advance' })
  requestAdvance(@CurrentUser() user: any, @Body() dto: RequestAdvanceDto) {
    return this.svc.requestAdvance(user.sub, dto);
  }

  @Get('runs')
  @ApiOperation({ summary: 'List payroll runs for the company' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @RequirePermissions('payroll.read')
  listPayrollRuns(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.listPayrollRuns(user.companyId, {
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('runs/:id')
  @ApiOperation({ summary: 'Get payroll run detail' })
  @RequirePermissions('payroll.read')
  getPayrollRun(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.getPayrollRun(user.companyId, id);
  }

  @Get('runs/:id/payslips')
  @ApiOperation({ summary: 'Get payroll run paylist rows' })
  @RequirePermissions('payroll.read')
  getRunPayslips(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.getRunPayslips(user.companyId, id);
  }

  @Post('runs')
  @HttpCode(201)
  @ApiOperation({ summary: 'Generate a payroll run' })
  @RequirePermissions('payroll.write')
  generatePayrollRun(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.generatePayrollRun(user.companyId, body, user);
  }

  @Put('runs/:id/approve')
  @ApiOperation({ summary: 'Approve a payroll run' })
  @RequirePermissions('payroll.manage')
  approvePayrollRun(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.approvePayrollRun(user.companyId, id, user);
  }

  @Put('runs/:id/close')
  @ApiOperation({ summary: 'Close a payroll run' })
  @RequirePermissions('payroll.manage')
  closePayrollRun(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.closePayrollRun(user.companyId, id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get payroll summary for a month' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @RequirePermissions('payroll.read')
  getPayrollSummary(@CurrentUser() user: any, @Query('month') month: string, @Query('year') year: string) {
    return this.svc.getPayrollSummary(user.companyId, parseInt(month), parseInt(year));
  }

  @Get('paylist')
  @ApiOperation({ summary: 'Get payroll paylist as JSON or CSV' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @RequirePermissions('payroll.read')
  getPaylist(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('format') format?: 'json' | 'csv',
  ) {
    return this.svc.getPaylist(user.companyId, parseInt(month), parseInt(year), format || 'json');
  }

  @Get('advances')
  @ApiOperation({ summary: 'List salary advances for the company' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @RequirePermissions('payroll.read')
  listSalaryAdvances(
    @CurrentUser() user: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.listSalaryAdvances(user.companyId, {
      employeeId,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post('advances')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a salary advance for an employee' })
  @RequirePermissions('payroll.write')
  createSalaryAdvance(@CurrentUser() user: any, @Body() body: RequestAdvanceDto & { employeeId: string }) {
    return this.svc.createSalaryAdvance(user.companyId, body);
  }

  @Put('advances/:id')
  @ApiOperation({ summary: 'Update a salary advance' })
  @RequirePermissions('payroll.write')
  updateSalaryAdvance(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.updateSalaryAdvance(user.companyId, id, body);
  }

  @Delete('advances/:id')
  @ApiOperation({ summary: 'Delete a salary advance' })
  @RequirePermissions('payroll.delete')
  deleteSalaryAdvance(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.deleteSalaryAdvance(user.companyId, id);
  }

  @Get('adjustments')
  @ApiOperation({ summary: 'List payroll adjustments' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @RequirePermissions('payroll.read')
  listPayrollAdjustments(
    @CurrentUser() user: any,
    @Query('employeeId') employeeId?: string,
    @Query('type') type?: string,
    @Query('code') code?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.listPayrollAdjustments(user.companyId, {
      employeeId,
      type,
      code,
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post('adjustments')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a payroll adjustment' })
  @RequirePermissions('payroll.write')
  createPayrollAdjustment(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.createPayrollAdjustment(user.companyId, body);
  }

  @Put('adjustments/:id')
  @ApiOperation({ summary: 'Update a payroll adjustment' })
  @RequirePermissions('payroll.write')
  updatePayrollAdjustment(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.updatePayrollAdjustment(user.companyId, id, body);
  }

  @Delete('adjustments/:id')
  @ApiOperation({ summary: 'Delete a payroll adjustment' })
  @RequirePermissions('payroll.delete')
  deletePayrollAdjustment(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.deletePayrollAdjustment(user.companyId, id);
  }

  @Get('components')
  @ApiOperation({ summary: 'List payroll components' })
  @RequirePermissions('payroll.read')
  listPayrollComponents(@CurrentUser() user: any) {
    return this.svc.listPayrollComponents(user.companyId);
  }

  @Post('components')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create or update a payroll component' })
  @RequirePermissions('payroll.write')
  upsertPayrollComponent(@CurrentUser() user: any, @Body() body: any) {
    return this.svc.upsertPayrollComponent(user.companyId, body);
  }

  @Delete('components/:id')
  @ApiOperation({ summary: 'Delete a payroll component' })
  @RequirePermissions('payroll.delete')
  deletePayrollComponent(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.deletePayrollComponent(user.companyId, id);
  }

  @Get('salary-history/:employeeId')
  @ApiOperation({ summary: 'Get payroll history for an employee' })
  @RequirePermissions('payroll.read')
  getEmployeeSalaryHistory(@CurrentUser() user: any, @Param('employeeId') employeeId: string) {
    return this.svc.getEmployeeSalaryHistory(user.companyId, employeeId);
  }
}
