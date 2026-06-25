import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PayrollService, RequestAdvanceDto } from './payroll.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
}
