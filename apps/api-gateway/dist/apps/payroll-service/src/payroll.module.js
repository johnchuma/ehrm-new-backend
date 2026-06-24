"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../../../libs/common/src/common.module");
const prisma_module_1 = require("../../../libs/common/src/prisma/prisma.module");
const payroll_runs_service_1 = require("./payroll-runs/payroll-runs.service");
const salary_advance_service_1 = require("./salary-advance/salary-advance.service");
const deductions_service_1 = require("./deductions/deductions.service");
const allowances_service_1 = require("./allowances/allowances.service");
const bonuses_service_1 = require("./bonuses/bonuses.service");
const settlements_service_1 = require("./settlements/settlements.service");
const journal_service_1 = require("./journal/journal.service");
const SERVICE_NAME = 'payroll';
let PayrollModule = class PayrollModule {
};
exports.PayrollModule = PayrollModule;
exports.PayrollModule = PayrollModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule.forServices(SERVICE_NAME)],
        providers: [
            {
                provide: prisma_module_1.PRISMA_CLIENT,
                useFactory: (client) => client,
                inject: [(0, prisma_module_1.prismaToken)(SERVICE_NAME)],
            },
            payroll_runs_service_1.PayrollRunService,
            salary_advance_service_1.AdvanceService,
            deductions_service_1.DeductionService,
            allowances_service_1.AllowanceService,
            bonuses_service_1.BonusService,
            settlements_service_1.SettlementService,
            journal_service_1.JournalService,
        ],
        exports: [payroll_runs_service_1.PayrollRunService, salary_advance_service_1.AdvanceService, deductions_service_1.DeductionService, allowances_service_1.AllowanceService, bonuses_service_1.BonusService, settlements_service_1.SettlementService, journal_service_1.JournalService],
    })
], PayrollModule);
//# sourceMappingURL=payroll.module.js.map