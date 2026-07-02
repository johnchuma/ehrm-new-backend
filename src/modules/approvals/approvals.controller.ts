import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Employee-dashboard view/action layer over the single stage-based approval
 * workflow. Tasks are addressed by a composite ref `TYPE:recordId`
 * (e.g. `LEAVE:clx123`), since approvals live on the records themselves.
 */
@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly svc: ApprovalsService) {}

  @Get('my-tasks')
  @ApiOperation({ summary: 'Pending approvals assigned to me (as approver)' })
  @ApiQuery({ name: 'type', required: false, description: 'LEAVE | OVERTIME' })
  myTasks(@CurrentUser() user: any, @Query('type') type?: string) {
    return this.svc.getMyTasks(user.sub, user.companyId ?? user.selectedCompanyId, { type });
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Approval status of requests I submitted' })
  @ApiQuery({ name: 'status', required: false })
  myRequests(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.svc.getMyRequests(user.sub, status);
  }

  @Get('approvers')
  @ApiOperation({ summary: 'Resolved approver chain for a module' })
  @ApiQuery({ name: 'moduleKey', required: false })
  approvers(@CurrentUser() user: any, @Query('moduleKey') moduleKey?: string) {
    return this.svc.getApprovers(user.companyId ?? user.selectedCompanyId, moduleKey);
  }

  @Post(':ref/submit')
  @HttpCode(200)
  @ApiOperation({ summary: 'Approve or reject a task (ref = TYPE:recordId)' })
  submit(
    @CurrentUser() user: any,
    @Param('ref') ref: string,
    @Body() body: { action?: string; comments?: string },
  ) {
    return this.svc.submit(user.sub, ref, body);
  }

  @Get(':ref/target-details')
  @ApiOperation({ summary: 'Underlying record details for a task (ref = TYPE:recordId)' })
  targetDetails(@CurrentUser() user: any, @Param('ref') ref: string) {
    return this.svc.getTargetDetails(user.sub, ref);
  }
}
