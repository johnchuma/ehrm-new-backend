import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly prisma: PrismaService) {}

  // ── Business Units ──

  @Get('business-units')
  @ApiOperation({ summary: 'List business units' })
  async listBusinessUnits(@Query('companyId') companyId: string) {
    return { data: await this.prisma.businessUnit.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('business-units')
  @ApiOperation({ summary: 'Create business unit' })
  async createBusinessUnit(@Body() body: any) {
    return this.prisma.businessUnit.create({ data: { companyId: body.companyId, name: body.name, code: body.code } });
  }

  @Put('business-units/:id')
  @ApiOperation({ summary: 'Update business unit' })
  async updateBusinessUnit(@Param('id') id: string, @Body() body: any) {
    return this.prisma.businessUnit.update({ where: { id }, data: { name: body.name, code: body.code } });
  }

  @Delete('business-units/:id')
  @ApiOperation({ summary: 'Delete business unit' })
  async deleteBusinessUnit(@Param('id') id: string) {
    return this.prisma.businessUnit.delete({ where: { id } });
  }

  // ── Sections ──

  @Get('sections')
  @ApiOperation({ summary: 'List sections' })
  async listSections(@Query('companyId') companyId: string) {
    return { data: await this.prisma.section.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('sections')
  @ApiOperation({ summary: 'Create section' })
  async createSection(@Body() body: any) {
    return this.prisma.section.create({ data: { companyId: body.companyId, name: body.name, code: body.code } });
  }

  @Put('sections/:id')
  @ApiOperation({ summary: 'Update section' })
  async updateSection(@Param('id') id: string, @Body() body: any) {
    return this.prisma.section.update({ where: { id }, data: { name: body.name, code: body.code } });
  }

  @Delete('sections/:id')
  @ApiOperation({ summary: 'Delete section' })
  async deleteSection(@Param('id') id: string) {
    return this.prisma.section.delete({ where: { id } });
  }

  // ── Job Titles ──

  @Get('job-titles')
  @ApiOperation({ summary: 'List job titles' })
  async listJobTitles(@Query('companyId') companyId: string) {
    return { data: await this.prisma.jobTitle.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('job-titles')
  @ApiOperation({ summary: 'Create job title' })
  async createJobTitle(@Body() body: any) {
    return this.prisma.jobTitle.create({ data: { companyId: body.companyId, name: body.name, code: body.code, grade: body.grade } });
  }

  @Put('job-titles/:id')
  @ApiOperation({ summary: 'Update job title' })
  async updateJobTitle(@Param('id') id: string, @Body() body: any) {
    return this.prisma.jobTitle.update({ where: { id }, data: { name: body.name, code: body.code, grade: body.grade } });
  }

  @Delete('job-titles/:id')
  @ApiOperation({ summary: 'Delete job title' })
  async deleteJobTitle(@Param('id') id: string) {
    return this.prisma.jobTitle.delete({ where: { id } });
  }

  // ── Grades ──

  @Get('grades')
  @ApiOperation({ summary: 'List grades' })
  async listGrades(@Query('companyId') companyId: string) {
    return { data: await this.prisma.grade.findMany({ where: { companyId }, orderBy: { rank: 'asc' } }) };
  }

  @Post('grades')
  @ApiOperation({ summary: 'Create grade' })
  async createGrade(@Body() body: any) {
    return this.prisma.grade.create({ data: { companyId: body.companyId, name: body.name, rank: body.rank || 0 } });
  }

  @Put('grades/:id')
  @ApiOperation({ summary: 'Update grade' })
  async updateGrade(@Param('id') id: string, @Body() body: any) {
    return this.prisma.grade.update({ where: { id }, data: { name: body.name, rank: body.rank } });
  }

  @Delete('grades/:id')
  @ApiOperation({ summary: 'Delete grade' })
  async deleteGrade(@Param('id') id: string) {
    return this.prisma.grade.delete({ where: { id } });
  }

  // ── Positions ──

  @Get('positions')
  @ApiOperation({ summary: 'List positions' })
  async listPositions(@Query('companyId') companyId: string) {
    return { data: await this.prisma.position.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('positions')
  @ApiOperation({ summary: 'Create position' })
  async createPosition(@Body() body: any) {
    return this.prisma.position.create({ data: { companyId: body.companyId, name: body.name, code: body.code } });
  }

  @Put('positions/:id')
  @ApiOperation({ summary: 'Update position' })
  async updatePosition(@Param('id') id: string, @Body() body: any) {
    return this.prisma.position.update({ where: { id }, data: { name: body.name, code: body.code } });
  }

  @Delete('positions/:id')
  @ApiOperation({ summary: 'Delete position' })
  async deletePosition(@Param('id') id: string) {
    return this.prisma.position.delete({ where: { id } });
  }

  // ── Contract Types ──

  @Get('contract-types')
  @ApiOperation({ summary: 'List contract types' })
  async listContractTypes(@Query('companyId') companyId: string) {
    return { data: await this.prisma.contractType.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('contract-types')
  @ApiOperation({ summary: 'Create contract type' })
  async createContractType(@Body() body: any) {
    return this.prisma.contractType.create({ data: { companyId: body.companyId, name: body.name, code: body.code } });
  }

  @Put('contract-types/:id')
  @ApiOperation({ summary: 'Update contract type' })
  async updateContractType(@Param('id') id: string, @Body() body: any) {
    return this.prisma.contractType.update({ where: { id }, data: { name: body.name, code: body.code } });
  }

  @Delete('contract-types/:id')
  @ApiOperation({ summary: 'Delete contract type' })
  async deleteContractType(@Param('id') id: string) {
    return this.prisma.contractType.delete({ where: { id } });
  }
}
