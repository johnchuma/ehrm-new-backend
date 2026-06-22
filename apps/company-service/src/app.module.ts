import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { CompanyController } from './companies/companies.controller';
import { BranchController } from './branches/branches.controller';
import { DepartmentController } from './departments/departments.controller';
import { SettingsController } from './settings/settings.controller';
import { CompanyService } from './companies/companies.service';
import { BranchService } from './branches/branches.service';
import { DepartmentService } from './departments/departments.service';
import { SettingsService } from './settings/settings.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('company')],
  controllers: [CompanyController, BranchController, DepartmentController, SettingsController],
  providers: [CompanyService, BranchService, DepartmentService, SettingsService],
})
export class AppModule {}
