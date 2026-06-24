import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from '../../../libs/common/src/common.module';
import { AuthGuard } from './auth/auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';

import { IamModule } from '../../iam-service/src/iam.module';
import { CompanyModule } from '../../company-service/src/company.module';
import { EmployeeModule } from '../../employee-service/src/employee.module';
import { AttendanceModule } from '../../attendance-service/src/attendance.module';
import { LeaveModule } from '../../leave-service/src/leave.module';
import { PayrollModule } from '../../payroll-service/src/payroll.module';
import { PerformanceModule } from '../../performance-service/src/performance.module';
import { TrainingModule } from '../../training-service/src/training.module';
import { OnboardingModule } from '../../onboarding-service/src/onboarding.module';
import { OffboardingModule } from '../../offboarding-service/src/offboarding.module';
import { MovementModule } from '../../movement-service/src/movement.module';
import { ContractsModule } from '../../contracts-service/src/contracts.module';
import { AssetsModule } from '../../assets-service/src/assets.module';
import { BenefitsModule } from '../../benefits-service/src/benefits.module';
import { DisciplinaryModule } from '../../disciplinary-service/src/disciplinary.module';
import { ComplianceModule } from '../../compliance-service/src/compliance.module';
import { AnnouncementsModule } from '../../announcements-service/src/announcements.module';
import { AnalyticsModule } from '../../analytics-service/src/analytics.module';
import { SalaryIntelligenceModule } from '../../salary-intelligence-service/src/salary-intelligence.module';
import { ExactAIModule } from '../../exactai-service/src/exactai.module';
import { NotificationsModule } from '../../notifications-service/src/notifications.module';
import { TasksModule } from '../../tasks-service/src/tasks.module';
import { HRQueryModule } from '../../hr-query-service/src/hr-query.module';
import { DocumentsModule } from '../../documents-service/src/documents.module';
import { IntegrationsModule } from '../../integrations-service/src/integrations.module';

import { IamController } from './iam/iam.controller';
import { CompanyController } from './company/company.controller';
import { EmployeeController } from './employee/employee.controller';
import { AttendanceController } from './attendance/attendance.controller';
import { LeaveController } from './leave/leave.controller';
import { PayrollController } from './payroll/payroll.controller';
import { PerformanceController } from './performance/performance.controller';
import { TrainingController } from './training/training.controller';
import { OnboardingController } from './onboarding/onboarding.controller';
import { OffboardingController } from './offboarding/offboarding.controller';
import { MovementController } from './movement/movement.controller';
import { ContractsController } from './contracts/contracts.controller';
import { AssetsController } from './assets/assets.controller';
import { BenefitsController } from './benefits/benefits.controller';
import { DisciplinaryController } from './disciplinary/disciplinary.controller';
import { ComplianceController } from './compliance/compliance.controller';
import { AnnouncementsController } from './announcements/announcements.controller';
import { AnalyticsController } from './analytics/analytics.controller';
import { SalaryIntelligenceController } from './salary-intelligence/salary-intelligence.controller';
import { ExactAIController } from './exactai/exactai.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { TasksController } from './tasks/tasks.controller';
import { HRQueryController } from './hr-query/hr-query.controller';
import { DocumentsController } from './documents/documents.controller';
import { IntegrationsController } from './integrations/integrations.controller';

@Module({
  imports: [
    CommonModule,
    IamModule,
    CompanyModule,
    EmployeeModule,
    AttendanceModule,
    LeaveModule,
    PayrollModule,
    PerformanceModule,
    TrainingModule,
    OnboardingModule,
    OffboardingModule,
    MovementModule,
    ContractsModule,
    AssetsModule,
    BenefitsModule,
    DisciplinaryModule,
    ComplianceModule,
    AnnouncementsModule,
    AnalyticsModule,
    SalaryIntelligenceModule,
    ExactAIModule,
    NotificationsModule,
    TasksModule,
    HRQueryModule,
    DocumentsModule,
    IntegrationsModule,
  ],
  controllers: [
    AppController,
    AuthController,
    IamController,
    CompanyController,
    EmployeeController,
    AttendanceController,
    LeaveController,
    PayrollController,
    PerformanceController,
    TrainingController,
    OnboardingController,
    OffboardingController,
    MovementController,
    ContractsController,
    AssetsController,
    BenefitsController,
    DisciplinaryController,
    ComplianceController,
    AnnouncementsController,
    AnalyticsController,
    SalaryIntelligenceController,
    ExactAIController,
    NotificationsController,
    TasksController,
    HRQueryController,
    DocumentsController,
    IntegrationsController,
  ],
  providers: [
    AuthGuard,
    JwtAuthGuard,
  ],
})
export class AppModule {}
