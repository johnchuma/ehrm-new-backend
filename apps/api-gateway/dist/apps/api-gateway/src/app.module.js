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
const grpc_module_1 = require("../../../libs/common/src/grpc/grpc.module");
const auth_guard_1 = require("./auth/auth.guard");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const app_controller_1 = require("./app.controller");
const auth_controller_1 = require("./auth/auth.controller");
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
            grpc_module_1.GrpcModule,
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