import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BenefitsService, SubmitClaimDto } from './benefits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Benefits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('benefits')
export class BenefitsController {
  constructor(private readonly svc: BenefitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all company benefits (with my enrollment status)' })
  getCompanyBenefits(@CurrentUser() user: any) {
    return this.svc.getCompanyBenefits(user.sub);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my enrolled benefits' })
  getMyBenefits(@CurrentUser() user: any) {
    return this.svc.getMyBenefits(user.sub);
  }

  @Get('me/claims')
  @ApiOperation({ summary: 'Get my benefit claims' })
  getMyClaims(@CurrentUser() user: any) {
    return this.svc.getMyClaims(user.sub);
  }

  @Post('me/claims')
  @HttpCode(201)
  @ApiOperation({ summary: 'Submit a benefit claim' })
  submitClaim(@CurrentUser() user: any, @Body() dto: SubmitClaimDto) {
    return this.svc.submitClaim(user.sub, dto);
  }

  // Admin endpoints

  @Get('admin')
  @ApiOperation({ summary: '[Admin] Get company benefit plans' })
  listAdminBenefits(@CurrentUser() user: any) {
    return this.svc.listAdminBenefits(user.companyId);
  }

  @Post('admin')
  @HttpCode(201)
  @ApiOperation({ summary: '[Admin] Create a benefit plan' })
  @RequirePermissions('benefits.write')
  createBenefit(@CurrentUser() user: any, @Body() dto: any) {
    return this.svc.createBenefit(user.companyId, dto);
  }

  @Post('admin/enroll')
  @HttpCode(200)
  @ApiOperation({ summary: '[Admin] Enroll an employee in a benefit' })
  @RequirePermissions('benefits.write')
  enrollEmployee(@CurrentUser() user: any, @Body() body: { employeeId: string; benefitId: string }) {
    return this.svc.enrollEmployee(user.companyId, body.employeeId, body.benefitId);
  }

  @Get('admin/claims')
  @ApiOperation({ summary: '[Admin] Get all benefit claims' })
  @RequirePermissions('benefits.read')
  getAllClaims(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.svc.getAllClaims(user.companyId, status);
  }

  @Put('admin/claims/:id')
  @ApiOperation({ summary: '[Admin] Approve or reject a benefit claim' })
  @RequirePermissions('benefits.manage')
  processClaim(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVED' | 'REJECTED'; reason?: string },
  ) {
    return this.svc.processClaim(id, body.action, user.sub, body.reason);
  }
}
