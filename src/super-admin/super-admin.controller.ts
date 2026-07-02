import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GlobalAdminGuard } from '../common/guards/global-admin.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SuperAdminService } from './super-admin.service';
import { SecurityService } from './security.service';
import { SubscriptionAdminService } from './subscriptions.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ImpersonateDto } from './dto/impersonate.dto';
import { UpdateCompanyDto, UpdateCompanyStatusDto } from './dto/update-company.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdatePlanPriceDto } from './dto/update-plan-price.dto';
import { Request } from 'express';

// ─── /super-admin/* routes (no impersonation allowed) ────────────────────────
@ApiTags('Super Admin')
@Controller('super-admin')
@UseGuards(JwtAuthGuard, GlobalAdminGuard)
export class SuperAdminController {
  constructor(
    private readonly svc: SuperAdminService,
    private readonly security: SecurityService,
    private readonly subs: SubscriptionAdminService,
  ) {}

  // Dashboard
  @Get('dashboard')
  @ApiOperation({ summary: 'Get super-admin dashboard statistics' })
  @RequirePermissions('super_admin.manage')
  getDashboard() {
    return this.svc.getDashboardStats();
  }

  // Companies
  @Get('companies')
  @ApiOperation({ summary: 'List all companies' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'SUSPENDED', 'DELETED'] })
  @RequirePermissions('companies.read')
  getCompanies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.svc.getAllCompanies(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
      status,
    );
  }

  @Post('companies')
  @ApiOperation({ summary: 'Create a new company and provision its admin' })
  @RequirePermissions('companies.write')
  createCompany(@Body() dto: CreateCompanyDto, @CurrentUser() user: any) {
    return this.svc.createCompany(dto, user.sub);
  }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company details' })
  @RequirePermissions('companies.read')
  getCompany(@Param('id') id: string) {
    return this.svc.getCompanyById(id);
  }

  @Put('companies/:id')
  @ApiOperation({ summary: 'Update company details' })
  @RequirePermissions('companies.write')
  updateCompany(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateCompany(id, dto, user.sub);
  }

  @Patch('companies/:id/status')
  @ApiOperation({ summary: 'Change company status (ACTIVE/SUSPENDED)' })
  @RequirePermissions('companies.manage')
  updateCompanyStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateCompanyStatus(id, dto, user);
  }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Soft-delete a company' })
  @RequirePermissions('companies.delete')
  deleteCompany(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.deleteCompany(id, user);
  }

  // Users
  @Get('users')
  @ApiOperation({ summary: 'List all users across companies' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @RequirePermissions('iam.read')
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.svc.getAllUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
    );
  }

  @Post('users')
  @ApiOperation({
    summary:
      'Deprecated — arbitrary user creation from the super-admin panel is forbidden. ' +
      'Use POST /super-admin/users/super-admin to create a system administrator.',
  })
  @RequirePermissions('iam.manage')
  createUser(@Body() _dto: CreateUserDto, @CurrentUser() _user: any) {
    // Arbitrary user creation from the super-admin panel is no longer allowed.
    // System-admin creation has its own endpoint (POST /users/super-admin).
    throw new ForbiddenException(
      'Creating arbitrary users from the super-admin panel is not allowed.',
    );
  }

  @Post('users/super-admin')
  @ApiOperation({ summary: 'Create a new super admin user' })
  @RequirePermissions('super_admin.manage')
  createSuperAdmin(@Body() dto: CreateSuperAdminDto, @CurrentUser() user: any) {
    return this.svc.createSuperAdmin(dto, user.sub);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update a user (name, email, password)' })
  @RequirePermissions('iam.manage')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
    return this.svc.updateUser(id, dto, user.sub);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Soft-delete a user' })
  @RequirePermissions('iam.delete')
  deleteUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.deleteUser(id, user.sub);
  }

  // Subscriptions & Billing
  @Get('subscriptions')
  @ApiOperation({ summary: 'Get subscription overview and MRR' })
  @RequirePermissions('companies.manage')
  getSubscriptionOverview() {
    return this.svc.getSubscriptionOverview();
  }

  @Get('billing')
  @ApiOperation({ summary: 'List company billing records' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @RequirePermissions('companies.manage')
  getBilling(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getCompanyBilling(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('companies/:id/plan')
  @ApiOperation({ summary: 'Change a company subscription plan' })
  @RequirePermissions('companies.manage')
  changePlan(
    @Param('id') id: string,
    @Body('planSlug') planSlug: string,
    @Body('billingInterval') billingInterval: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.changePlan(id, planSlug, billingInterval ?? 'MONTHLY', user.sub);
  }

  // ── Subscription Management ────────────────────────────────────────────────

  @Get('subs/overview')
  @ApiOperation({ summary: 'Subscription KPI overview (MRR, active subs, trials)' })
  @RequirePermissions('companies.manage')
  getSubsOverview() {
    return this.subs.getOverview();
  }

  @Get('subs/companies')
  @ApiOperation({ summary: 'List all companies with their subscription details' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'plan', required: false })
  @RequirePermissions('companies.manage')
  getSubsCompanies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
  ) {
    return this.subs.getCompanySubscriptions(
      page ? +page : 1,
      limit ? +limit : 50,
      search,
      status,
      plan,
    );
  }

  @Get('subs/plans')
  @ApiOperation({ summary: 'List all subscription plans' })
  @RequirePermissions('companies.manage')
  getSubsPlans() {
    return this.subs.getPlans();
  }

  @Post('subs/plans')
  @ApiOperation({ summary: 'Deprecated — plans cannot be created from the dashboard' })
  @RequirePermissions('super_admin.manage')
  createPlan(@Body() _body: any) {
    throw new ForbiddenException('Subscription plans cannot be created from the dashboard.');
  }

  @Put('subs/plans/:id')
  @ApiOperation({ summary: 'Update a subscription plan (price only)' })
  @RequirePermissions('super_admin.manage')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanPriceDto) {
    // Only monthlyPrice / annualPrice are accepted — any other field is
    // rejected with a 400 by the global whitelist ValidationPipe.
    return this.subs.updatePlan(id, dto);
  }

  @Delete('subs/plans/:id')
  @ApiOperation({ summary: 'Deprecated — plans cannot be deleted from the dashboard' })
  @RequirePermissions('super_admin.manage')
  deletePlan(@Param('id') _id: string) {
    throw new ForbiddenException('Subscription plans cannot be deleted from the dashboard.');
  }

  @Get('subs/usage')
  @ApiOperation({ summary: 'Usage stats: module adoption, API calls, employee counts' })
  @RequirePermissions('companies.manage')
  getSubsUsage() {
    return this.subs.getUsageStats();
  }

  @Patch('subs/companies/:id/limit')
  @ApiOperation({ summary: 'Set a custom user/seat limit for a company' })
  @RequirePermissions('companies.manage')
  setCompanyLimit(@Param('id') id: string, @Body('userLimit') userLimit: any) {
    const limit = userLimit === null || userLimit === '' ? null : Number(userLimit);
    return this.subs.setCompanyLimit(id, limit);
  }

  @Patch('subs/companies/:id/modules')
  @ApiOperation({ summary: 'Configure enabled modules for a company' })
  @RequirePermissions('companies.manage')
  setCompanyModules(@Param('id') id: string, @Body('modules') modules: string[]) {
    return this.subs.setCompanyModules(id, modules || []);
  }

  @Post('subs/companies/:id/extend-trial')
  @ApiOperation({ summary: 'Extend a company trial by N days' })
  @RequirePermissions('companies.manage')
  extendTrial(@Param('id') id: string, @Body('days') days: number) {
    return this.subs.extendTrial(id, days ?? 7);
  }

  @Get('subs/billing-alerts')
  @ApiOperation({ summary: 'List billing alerts (auto-synced from subscription states)' })
  @ApiQuery({ name: 'resolved', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @RequirePermissions('companies.manage')
  getBillingAlerts(
    @Query('resolved') resolved?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const resolvedBool = resolved === undefined ? undefined : resolved === 'true';
    return this.subs.getBillingAlerts(resolvedBool, page ? +page : 1, limit ? +limit : 50);
  }

  @Patch('subs/billing-alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve a billing alert' })
  @RequirePermissions('companies.manage')
  resolveBillingAlert(@Param('id') id: string, @CurrentUser() user: any) {
    return this.subs.resolveBillingAlert(id, user.sub);
  }

  // Audit Logs
  // Security
  @Get('security/overview')
  @ApiOperation({ summary: 'Security dashboard overview stats' })
  getSecurityOverview() {
    return this.security.getOverview();
  }

  @Get('security/users')
  @ApiOperation({ summary: 'List users with security details' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false })
  getSecurityUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.security.getUsers(page ? +page : 1, limit ? +limit : 20, search, role);
  }

  @Patch('security/users/:id/force-mfa')
  @ApiOperation({ summary: 'Force-enable MFA for a user' })
  forceMfa(@Param('id') id: string) {
    return this.security.forceMfa(id);
  }

  @Get('security/sessions')
  @ApiOperation({ summary: 'List all active sessions' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getSessions(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.security.getSessions(page ? +page : 1, limit ? +limit : 20);
  }

  @Delete('security/sessions/:sessionId')
  @ApiOperation({ summary: 'Force-terminate a session' })
  revokeSession(@Param('sessionId') sessionId: string) {
    return this.security.revokeSession(sessionId);
  }

  @Delete('security/users/:id/sessions')
  @ApiOperation({ summary: 'Force-logout all sessions for a user' })
  revokeUserSessions(@Param('id') id: string) {
    return this.security.revokeUserSessions(id);
  }

  @Get('security/login-events')
  @ApiOperation({ summary: 'Paginated auth event log' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getLoginEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.security.getLoginEvents(page ? +page : 1, limit ? +limit : 50, from, to);
  }

  @Get('security/alerts')
  @ApiOperation({ summary: 'List security alerts' })
  @ApiQuery({ name: 'resolved', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAlerts(
    @Query('resolved') resolved?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const resolvedBool = resolved === undefined ? undefined : resolved === 'true';
    return this.security.getAlerts(resolvedBool, page ? +page : 1, limit ? +limit : 50);
  }

  @Patch('security/alerts/:id/resolve')
  @ApiOperation({ summary: 'Mark a security alert as resolved' })
  resolveAlert(@Param('id') id: string, @CurrentUser() user: any) {
    return this.security.resolveAlert(id, user.sub);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Query audit logs across all companies' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'actorId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'search', required: false })
  @RequirePermissions('super_admin.manage')
  getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
  ) {
    return this.svc.getAuditLogs({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      companyId,
      actorId,
      action,
      resource,
      from,
      to,
      search,
    });
  }
}

// ─── /admin/impersonate — accessible with a valid super-admin token ────────────
// GlobalAdminGuard is NOT applied here to allow issuing the impersonation token.
// JwtAuthGuard ensures authentication is still required.
@ApiTags('Admin Impersonation')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminImpersonationController {
  constructor(private readonly svc: SuperAdminService) {}

  @Post('impersonate')
  @ApiOperation({
    summary: 'Exchange super-admin JWT for a 1h scoped impersonation token',
    description:
      'Returns a short-lived token that has Company Admin role for the target company. ' +
      'Cannot be used to call /super-admin/* routes. All actions are logged.',
  })
  @RequirePermissions('super_admin.manage')
  impersonate(
    @Body() dto: ImpersonateDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    if (user.isImpersonating) {
      throw new Error('Cannot impersonate while already using an impersonation token');
    }
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip;
    return this.svc.exchangeImpersonationToken(dto.targetCompanyId, user, ip);
  }
}
