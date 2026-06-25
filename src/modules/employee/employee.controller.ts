import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeService, UpdateProfileDto } from './employee.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Employee - Self Service')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly svc: EmployeeService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my employee profile' })
  getMyProfile(@CurrentUser() user: any) {
    return this.svc.getMyProfile(user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update my employee profile (self-service fields only)' })
  updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.svc.updateMyProfile(user.sub, dto);
  }

  @Get('me/documents')
  @ApiOperation({ summary: 'Get my documents' })
  getMyDocuments(@CurrentUser() user: any) {
    return this.svc.getMyDocuments(user.sub);
  }

  @Get('me/direct-reports')
  @ApiOperation({ summary: 'Get my direct reports (manager view)' })
  getDirectReports(@CurrentUser() user: any) {
    return this.svc.getDirectReports(user.sub);
  }

  @Get('org-chart')
  @ApiOperation({ summary: 'Get company org chart' })
  getOrgChart(@CurrentUser() user: any) {
    return this.svc.getOrgChart(user.sub);
  }
}
