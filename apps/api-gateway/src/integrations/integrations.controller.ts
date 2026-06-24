import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { IntegrationService } from '../../../integrations-service/src/integrations/integrations.service';
import { WebhookService } from '../../../integrations-service/src/webhooks/webhooks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly webhookService: WebhookService,
  ) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'type', 'provider', 'config', 'credentials'],
      properties: {
        companyId: { type: 'string', example: 'comp_tz_001' },
        name: { type: 'string', example: 'Tigo Pesa Payment Gateway' },
        type: { type: 'string', example: 'Payment' },
        provider: { type: 'string', example: 'Tigo Pesa' },
        config: {
          type: 'object',
          example: { baseUrl: 'https://api.tigopesa.co.tz', environment: 'production', timeout: 30000 },
        },
        credentials: {
          type: 'object',
          example: { apiKey: 'tp_live_abc123', merchantId: 'M12345678' },
        },
      },
    },
  })
  create(@Body() body: any) { return this.integrationService.create(body); }

  @Get()
  list(@Query() query: any) { return this.integrationService.list(query.companyId, query.type); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Tigo Pesa Payment Gateway v2' },
        config: {
          type: 'object',
          example: { baseUrl: 'https://api.tigopesa.co.tz/v2', environment: 'production', timeout: 45000 },
        },
        credentials: {
          type: 'object',
          example: { apiKey: 'tp_live_xyz789', merchantId: 'M12345678' },
        },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return this.integrationService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.integrationService.delete(id); }

  @Post(':id/toggle')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['isActive', 'updatedBy'],
      properties: {
        isActive: { type: 'boolean', example: false },
        updatedBy: { type: 'string', example: 'emp_005' },
      },
    },
  })
  toggle(@Param('id') id: string, @Body() body: any) { return this.integrationService.toggle(id, body.isActive); }

  @Post('webhooks')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'url', 'events'],
      properties: {
        companyId: { type: 'string', example: 'comp_tz_001' },
        name: { type: 'string', example: 'Employee Payroll Notification' },
        url: { type: 'string', example: 'https://erp.company.co.tz/webhooks/payroll' },
        events: { type: 'array', items: { type: 'string' }, example: ['employee.created', 'payroll.processed'] },
        secret: { type: 'string', example: 'whsec_tz_abc123xyz' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  createWh(@Body() body: any) { return this.webhookService.create(body); }

  @Get('webhooks')
  listWh(@Query() query: any) { return this.webhookService.list(query.companyId); }

  @Delete('webhooks/:id')
  removeWh(@Param('id') id: string) { return this.webhookService.delete(id); }
}
