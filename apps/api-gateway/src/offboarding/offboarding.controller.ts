import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Offboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offboarding')
export class OffboardingController {
  private offService: any;
  private clrService: any;

  constructor(@Inject(GRPC_SERVICES.OFFBOARDING) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.offService = this.client.getService('OffboardingService');
    this.clrService = this.client.getService('ClearanceService');
  }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'reason', 'lastWorkingDay'],
      properties: {
        employeeId: { type: 'string', example: 'emp-015' },
        companyId: { type: 'string', example: 'comp-001' },
        reason: { type: 'string', example: 'Resignation' },
        lastWorkingDay: { type: 'string', example: '2026-08-15' },
        handoverTo: { type: 'string', example: 'emp-020' },
      },
    },
  })
  create(@Body() body: any) { return firstValueFrom(this.offService.CreateOffboarding(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.offService.ListOffboardings(query)); }

  @Get(':id')
  get(@Param('id') id: string) { return firstValueFrom(this.offService.GetOffboarding({ id })); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'in_progress' },
        lastWorkingDay: { type: 'string', example: '2026-08-15' },
        reason: { type: 'string', example: 'Resignation - relocated to Dar es Salaam' },
        notes: { type: 'string', example: 'Handover meeting scheduled for Aug 10' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.offService.UpdateOffboarding({ id, ...body })); }

  @Post(':id/clearance')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['department', 'checklistItems'],
      properties: {
        department: { type: 'string', example: 'IT Department' },
        checklistItems: {
          type: 'array',
          items: { type: 'string' },
          example: ['Return laptop', 'Return access badge', 'Transfer project files'],
        },
        notes: { type: 'string', example: 'All IT equipment to be returned by Aug 12' },
      },
    },
  })
  advance(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.offService.AdvanceClearance({ id, ...body })); }

  @Post(':id/complete')
  complete(@Param('id') id: string) { return firstValueFrom(this.offService.CompleteOffboarding({ id })); }

  @Post('clearance')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['offboardingId', 'department', 'checklistItems'],
      properties: {
        offboardingId: { type: 'string', example: 'off-001' },
        department: { type: 'string', example: 'Finance Department' },
        checklistItems: {
          type: 'array',
          items: { type: 'string' },
          example: ['Settle outstanding advances', 'Return company credit card', 'Clear petty cash'],
        },
      },
    },
  })
  createClr(@Body() body: any) { return firstValueFrom(this.clrService.CreateClearance(body)); }

  @Get('clearance/:offboardingId')
  listClr(@Param('offboardingId') offboardingId: string) { return firstValueFrom(this.clrService.ListClearances({ offboardingId })); }

  @Post('clearance/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string', example: 'emp-005' },
        notes: { type: 'string', example: 'All items verified and returned in good condition' },
      },
    },
  })
  approveClr(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.clrService.ApproveClearance({ id, ...body })); }
}
