import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcryptjs';

@ApiTags('IAM - Users & Roles')
@ApiBearerAuth()
@Controller('iam')
export class IamController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async listUsers(@Query() query: any) {
    const users = await this.prisma.user.findMany({
      where: query.companyId ? { companyId: query.companyId } : {},
    });
    return { users };
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() body: CreateUserDto) {
    const hashed = await bcrypt.hash(body.password || 'demo1234', 12);
    const user = await this.prisma.user.create({
      data: {
        email: (body.email || '').toLowerCase(),
        password: hashed,
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        fullName: `${body.firstName || ''} ${body.lastName || ''}`.trim() || body.email,
        companyId: body.companyId || '',
        isActive: true,
      },
    });
    return user;
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const data: any = {};
    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.email !== undefined) data.email = body.email?.toLowerCase();
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.firstName || body.lastName) {
      const current = await this.prisma.user.findUnique({ where: { id } });
      data.fullName = `${body.firstName || current?.firstName || ''} ${body.lastName || current?.lastName || ''}`.trim();
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
