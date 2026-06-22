import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { CommonModule } from '../../../libs/common/src/common.module';
import { GrpcModule, GRPC_SERVICES, SERVICE_PORTS, PROTO_PATH, getProtoPath } from '../../../libs/common/src/grpc/grpc.module';
import { AuthGuard } from './auth/auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
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
    GrpcModule,
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
