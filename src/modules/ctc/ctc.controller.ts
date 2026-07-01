import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CtcService, NonPayrollCostDto } from './ctc.service';

@ApiTags('Cost to Company')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ctc')
export class CtcController {
  constructor(private readonly svc: CtcService) {}

  @Get('non-payroll-costs')
  @ApiOperation({ summary: 'List company non-payroll costs' })
  listNonPayrollCosts(
    @CurrentUser() user: any,
    @Query('companyId') companyId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('category') category?: string,
  ) {
    return this.svc.listNonPayrollCosts(user, { companyId, month, year, category });
  }

  @Post('non-payroll-costs')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a company non-payroll cost' })
  createNonPayrollCost(@CurrentUser() user: any, @Body() dto: NonPayrollCostDto) {
    return this.svc.createNonPayrollCost(user, dto);
  }

  @Put('non-payroll-costs/:id')
  @ApiOperation({ summary: 'Update a company non-payroll cost' })
  updateNonPayrollCost(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: NonPayrollCostDto) {
    return this.svc.updateNonPayrollCost(user, id, dto);
  }

  @Delete('non-payroll-costs/:id')
  @ApiOperation({ summary: 'Delete a company non-payroll cost' })
  deleteNonPayrollCost(@CurrentUser() user: any, @Param('id') id: string, @Query('companyId') companyId?: string) {
    return this.svc.deleteNonPayrollCost(user, id, companyId);
  }
}