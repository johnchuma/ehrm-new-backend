import { Controller, Get, Post, Body } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly company: CompanyService) {}

  @Post('companies')
  create(@Body() body: any) {
    return this.company.create(body);
  }

  @Get('companies')
  findAll() {
    return this.company.findAll();
  }
}
