import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { CompanyService } from './companies/companies.service';
import { BranchService } from './branches/branches.service';
import { DepartmentService } from './departments/departments.service';
import { SettingsService } from './settings/settings.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [CompanyService, BranchService, DepartmentService, SettingsService],
  exports: [CompanyService, BranchService, DepartmentService, SettingsService],
})
export class CompanyModule {}
