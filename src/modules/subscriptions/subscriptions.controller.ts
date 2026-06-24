import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  getPlans() { return this.service.getPlans(); }

  @Get('companies')
  @ApiOperation({ summary: 'Get company subscriptions' })
  getCompanies() { return this.service.getCompanies(); }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoices' })
  getInvoices() { return this.service.getInvoices(); }

  @Get('usage')
  @ApiOperation({ summary: 'Get usage metrics' })
  getUsage() { return this.service.getUsageMetrics(); }

  @Get('alerts')
  @ApiOperation({ summary: 'Get subscription alerts' })
  getAlerts() { return this.service.getAlerts(); }
}
