import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
  private intService: any;
  private whService: any;

  constructor(@Inject(GRPC_SERVICES.INTEGRATIONS) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.intService = this.client.getService('IntegrationService');
    this.whService = this.client.getService('WebhookService');
  }

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
  create(@Body() body: any) { return firstValueFrom(this.intService.CreateIntegration(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.intService.ListIntegrations(query)); }

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
  update(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.intService.UpdateIntegration({ id, ...body })); }

  @Delete(':id')
  remove(@Param('id') id: string) { return firstValueFrom(this.intService.DeleteIntegration({ id })); }

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
  toggle(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.intService.ToggleIntegration({ id, ...body })); }

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
  createWh(@Body() body: any) { return firstValueFrom(this.whService.CreateWebhook(body)); }

  @Get('webhooks')
  listWh(@Query() query: any) { return firstValueFrom(this.whService.ListWebhooks(query)); }

  @Delete('webhooks/:id')
  removeWh(@Param('id') id: string) { return firstValueFrom(this.whService.DeleteWebhook({ id })); }
}
