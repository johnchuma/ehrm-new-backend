import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Movement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('movement')
export class MovementController {
  private trService: any;
  private prService: any;

  constructor(@Inject(GRPC_SERVICES.MOVEMENT) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.trService = this.client.getService('TransferService');
    this.prService = this.client.getService('PromotionService');
  }

  @Post('transfers')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'fromDepartment', 'toDepartment', 'effectiveDate', 'reason'],
      properties: {
        employeeId: { type: 'string', example: 'emp_001' },
        companyId: { type: 'string', example: 'comp_tz_001' },
        fromDepartment: { type: 'string', example: 'Finance' },
        toDepartment: { type: 'string', example: 'Operations' },
        fromPosition: { type: 'string', example: 'Accounts Clerk' },
        toPosition: { type: 'string', example: 'Operations Officer' },
        effectiveDate: { type: 'string', example: '2026-07-01' },
        reason: { type: 'string', example: 'Transfer to fill critical vacancy in Operations department, Dar es Salaam office' },
      },
    },
  })
  createTr(@Body() body: any) { return firstValueFrom(this.trService.CreateTransfer(body)); }

  @Get('transfers')
  listTr(@Query() query: any) { return firstValueFrom(this.trService.ListTransfers(query)); }

  @Post('transfers/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string', example: 'emp_020' },
        notes: { type: 'string', example: 'Transfer approved by Department Head pending employee acceptance' },
      },
    },
  })
  approveTr(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.trService.ApproveTransfer({ id, ...body })); }

  @Post('promotions')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'fromPosition', 'toPosition', 'newSalary', 'effectiveDate', 'reason'],
      properties: {
        employeeId: { type: 'string', example: 'emp_003' },
        companyId: { type: 'string', example: 'comp_tz_001' },
        fromPosition: { type: 'string', example: 'Software Developer' },
        toPosition: { type: 'string', example: 'Senior Software Developer' },
        newSalary: { type: 'number', example: 3500000 },
        effectiveDate: { type: 'string', example: '2026-07-01' },
        reason: { type: 'string', example: 'Promotion in recognition of outstanding performance during Q1 2026 review period' },
      },
    },
  })
  createPr(@Body() body: any) { return firstValueFrom(this.prService.CreatePromotion(body)); }

  @Get('promotions')
  listPr(@Query() query: any) { return firstValueFrom(this.prService.ListPromotions(query)); }

  @Post('promotions/:id/approve')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['approvedBy'],
      properties: {
        approvedBy: { type: 'string', example: 'emp_025' },
        notes: { type: 'string', example: 'Promotion approved by Managing Director effective from next payroll cycle' },
      },
    },
  })
  approvePr(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.prService.ApprovePromotion({ id, ...body })); }
}
