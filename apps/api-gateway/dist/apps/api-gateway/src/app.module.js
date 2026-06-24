"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../../../libs/common/src/common.module");
const auth_guard_1 = require("./auth/auth.guard");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const app_controller_1 = require("./app.controller");
const auth_controller_1 = require("./auth/auth.controller");
const iam_module_1 = require("../../iam-service/src/iam.module");
const company_module_1 = require("../../company-service/src/company.module");
const employee_module_1 = require("../../employee-service/src/employee.module");
const attendance_module_1 = require("../../attendance-service/src/attendance.module");
const leave_module_1 = require("../../leave-service/src/leave.module");
const payroll_module_1 = require("../../payroll-service/src/payroll.module");
const performance_module_1 = require("../../performance-service/src/performance.module");
const training_module_1 = require("../../training-service/src/training.module");
const onboarding_module_1 = require("../../onboarding-service/src/onboarding.module");
const offboarding_module_1 = require("../../offboarding-service/src/offboarding.module");
const movement_module_1 = require("../../movement-service/src/movement.module");
const contracts_module_1 = require("../../contracts-service/src/contracts.module");
const assets_module_1 = require("../../assets-service/src/assets.module");
const benefits_module_1 = require("../../benefits-service/src/benefits.module");
const disciplinary_module_1 = require("../../disciplinary-service/src/disciplinary.module");
const compliance_module_1 = require("../../compliance-service/src/compliance.module");
const announcements_module_1 = require("../../announcements-service/src/announcements.module");
const analytics_module_1 = require("../../analytics-service/src/analytics.module");
const salary_intelligence_module_1 = require("../../salary-intelligence-service/src/salary-intelligence.module");
const exactai_module_1 = require("../../exactai-service/src/exactai.module");
const notifications_module_1 = require("../../notifications-service/src/notifications.module");
const tasks_module_1 = require("../../tasks-service/src/tasks.module");
const hr_query_module_1 = require("../../hr-query-service/src/hr-query.module");
const documents_module_1 = require("../../documents-service/src/documents.module");
const integrations_module_1 = require("../../integrations-service/src/integrations.module");
const iam_controller_1 = require("./iam/iam.controller");
const company_controller_1 = require("./company/company.controller");
const employee_controller_1 = require("./employee/employee.controller");
const attendance_controller_1 = require("./attendance/attendance.controller");
const leave_controller_1 = require("./leave/leave.controller");
const payroll_controller_1 = require("./payroll/payroll.controller");
const performance_controller_1 = require("./performance/performance.controller");
const training_controller_1 = require("./training/training.controller");
const onboarding_controller_1 = require("./onboarding/onboarding.controller");
const offboarding_controller_1 = require("./offboarding/offboarding.controller");
const movement_controller_1 = require("./movement/movement.controller");
const contracts_controller_1 = require("./contracts/contracts.controller");
const assets_controller_1 = require("./assets/assets.controller");
const benefits_controller_1 = require("./benefits/benefits.controller");
const disciplinary_controller_1 = require("./disciplinary/disciplinary.controller");
const compliance_controller_1 = require("./compliance/compliance.controller");
const announcements_controller_1 = require("./announcements/announcements.controller");
const analytics_controller_1 = require("./analytics/analytics.controller");
const salary_intelligence_controller_1 = require("./salary-intelligence/salary-intelligence.controller");
const exactai_controller_1 = require("./exactai/exactai.controller");
const notifications_controller_1 = require("./notifications/notifications.controller");
const tasks_controller_1 = require("./tasks/tasks.controller");
const hr_query_controller_1 = require("./hr-query/hr-query.controller");
const documents_controller_1 = require("./documents/documents.controller");
const integrations_controller_1 = require("./integrations/integrations.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            common_module_1.CommonModule,
            iam_module_1.IamModule,
            company_module_1.CompanyModule,
            employee_module_1.EmployeeModule,
            attendance_module_1.AttendanceModule,
            leave_module_1.LeaveModule,
            payroll_module_1.PayrollModule,
            performance_module_1.PerformanceModule,
            training_module_1.TrainingModule,
            onboarding_module_1.OnboardingModule,
            offboarding_module_1.OffboardingModule,
            movement_module_1.MovementModule,
            contracts_module_1.ContractsModule,
            assets_module_1.AssetsModule,
            benefits_module_1.BenefitsModule,
            disciplinary_module_1.DisciplinaryModule,
            compliance_module_1.ComplianceModule,
            announcements_module_1.AnnouncementsModule,
            analytics_module_1.AnalyticsModule,
            salary_intelligence_module_1.SalaryIntelligenceModule,
            exactai_module_1.ExactAIModule,
            notifications_module_1.NotificationsModule,
            tasks_module_1.TasksModule,
            hr_query_module_1.HRQueryModule,
            documents_module_1.DocumentsModule,
            integrations_module_1.IntegrationsModule,
        ],
        controllers: [
            app_controller_1.AppController,
            auth_controller_1.AuthController,
            iam_controller_1.IamController,
            company_controller_1.CompanyController,
            employee_controller_1.EmployeeController,
            attendance_controller_1.AttendanceController,
            leave_controller_1.LeaveController,
            payroll_controller_1.PayrollController,
            performance_controller_1.PerformanceController,
            training_controller_1.TrainingController,
            onboarding_controller_1.OnboardingController,
            offboarding_controller_1.OffboardingController,
            movement_controller_1.MovementController,
            contracts_controller_1.ContractsController,
            assets_controller_1.AssetsController,
            benefits_controller_1.BenefitsController,
            disciplinary_controller_1.DisciplinaryController,
            compliance_controller_1.ComplianceController,
            announcements_controller_1.AnnouncementsController,
            analytics_controller_1.AnalyticsController,
            salary_intelligence_controller_1.SalaryIntelligenceController,
            exactai_controller_1.ExactAIController,
            notifications_controller_1.NotificationsController,
            tasks_controller_1.TasksController,
            hr_query_controller_1.HRQueryController,
            documents_controller_1.DocumentsController,
            integrations_controller_1.IntegrationsController,
        ],
        providers: [
            auth_guard_1.AuthGuard,
            jwt_auth_guard_1.JwtAuthGuard,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map