import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { CompanyService } from './companies/companies.service';
import { BranchService } from './branches/branches.service';
import { DepartmentService } from './departments/departments.service';
import { SettingsService } from './settings/settings.service';

const SERVICE_NAME = 'company';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: (client: any) => client,
      inject: [prismaToken(SERVICE_NAME)],
    },
    CompanyService,
    BranchService,
    DepartmentService,
    SettingsService,
  ],
  exports: [CompanyService, BranchService, DepartmentService, SettingsService],
})
export class CompanyModule {}
