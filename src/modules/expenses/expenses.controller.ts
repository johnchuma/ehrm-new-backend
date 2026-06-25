import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService, SubmitExpenseDto } from './expenses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly svc: ExpensesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my expense claims' })
  getMyClaims(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.svc.getMyClaims(user.sub, status);
  }

  @Get('me/:id')
  @ApiOperation({ summary: 'Get expense claim detail' })
  getClaimById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.getClaimById(user.sub, id);
  }

  @Post('me')
  @HttpCode(201)
  @ApiOperation({ summary: 'Submit a new expense claim' })
  submitClaim(@CurrentUser() user: any, @Body() dto: SubmitExpenseDto) {
    return this.svc.submitClaim(user.sub, dto);
  }

  @Delete('me/:id')
  @ApiOperation({ summary: 'Cancel a pending expense claim' })
  cancelClaim(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.cancelClaim(user.sub, id);
  }

  @Get('admin')
  @ApiOperation({ summary: '[Admin/Finance] Get all company expense claims' })
  getAllClaims(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.svc.getAllClaims(user.companyId, status);
  }

  @Put('admin/:id')
  @ApiOperation({ summary: '[Admin/Finance] Approve or reject an expense claim' })
  processClaim(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVED' | 'REJECTED'; reason?: string },
  ) {
    return this.svc.processClaim(id, body.action, user.sub, body.reason);
  }
}
