import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HRQueryService, CreateQueryDto } from './hrquery.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('HR Queries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hrquery')
export class HRQueryController {
  constructor(private readonly svc: HRQueryService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my HR queries' })
  getMyQueries(@CurrentUser() user: any) {
    return this.svc.getMyQueries(user.sub);
  }

  @Get('me/:id')
  @ApiOperation({ summary: 'Get HR query detail with messages' })
  getQueryById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.svc.getQueryById(user.sub, id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Raise a new HR query' })
  createQuery(@CurrentUser() user: any, @Body() dto: CreateQueryDto) {
    return this.svc.createQuery(user.sub, dto);
  }

  @Post('me/:id/message')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add a reply message to an HR query' })
  addMessage(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { message: string }) {
    return this.svc.addMessage(user.sub, id, body.message);
  }

  // HR staff endpoints (company admin / HR role)

  @Get('all')
  @ApiOperation({ summary: '[HR] Get all company queries' })
  @ApiQuery({ name: 'status', required: false })
  getAllQueries(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.svc.getAllQueries(user.companyId, status);
  }

  @Post(':id/reply')
  @HttpCode(201)
  @ApiOperation({ summary: '[HR] Reply to a query and optionally update status' })
  replyQuery(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { message: string; isInternal?: boolean; status?: string },
  ) {
    return this.svc.replyQuery(user.sub, id, body.message, body.isInternal, body.status);
  }
}
