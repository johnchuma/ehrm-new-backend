import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { SnipepayWebhookPayload } from './snipepay.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GlobalAdminGuard } from '../../common/guards/global-admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

// ─── Public plans (no auth needed for register page) ─────────────────────────
@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly svc: PaymentsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all active public plans (no auth required)' })
  getPlans() {
    return this.svc.getPlans();
  }
}

// ─── Payments (company admin) ─────────────────────────────────────────────────
@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initiate a payment for a subscription plan' })
  initiatePayment(@Body() dto: InitiatePaymentDto, @CurrentUser() user: any) {
    return this.svc.initiatePayment(user.selectedCompanyId, dto);
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check payment status (polls gateway if still pending)' })
  getStatus(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.getPaymentStatus(id, user.selectedCompanyId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment history for my company' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getHistory(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getCompanyPaymentHistory(
      user.selectedCompanyId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  // Snipepay posts here after payment completes — must be public
  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Snipepay payment webhook (called by gateway, not frontend)' })
  handleWebhook(@Body() payload: SnipepayWebhookPayload) {
    return this.svc.handleWebhook(payload);
  }
}

// ─── Super admin payment management ──────────────────────────────────────────
@ApiTags('Super Admin — Payments')
@Controller('super-admin/payments')
@UseGuards(JwtAuthGuard, GlobalAdminGuard)
export class SuperAdminPaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Revenue stats: MRR, ARR, transaction counts, monthly chart' })
  getStats() {
    return this.svc.getPaymentStats();
  }

  @Get()
  @ApiOperation({ summary: 'List all payments across all companies' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'COMPLETED', 'FAILED'] })
  @ApiQuery({ name: 'companyId', required: false })
  getAllPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.svc.getAllPayments(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
      companyId,
    );
  }
}
