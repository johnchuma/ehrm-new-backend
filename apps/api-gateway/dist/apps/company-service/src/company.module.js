"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../../../libs/common/src/common.module");
const prisma_module_1 = require("../../../libs/common/src/prisma/prisma.module");
const companies_service_1 = require("./companies/companies.service");
const branches_service_1 = require("./branches/branches.service");
const departments_service_1 = require("./departments/departments.service");
const settings_service_1 = require("./settings/settings.service");
const SERVICE_NAME = 'company';
let CompanyModule = class CompanyModule {
};
exports.CompanyModule = CompanyModule;
exports.CompanyModule = CompanyModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule.forServices(SERVICE_NAME)],
        providers: [
            {
                provide: prisma_module_1.PRISMA_CLIENT,
                useFactory: (client) => client,
                inject: [(0, prisma_module_1.prismaToken)(SERVICE_NAME)],
            },
            companies_service_1.CompanyService,
            branches_service_1.BranchService,
            departments_service_1.DepartmentService,
            settings_service_1.SettingsService,
        ],
        exports: [companies_service_1.CompanyService, branches_service_1.BranchService, departments_service_1.DepartmentService, settings_service_1.SettingsService],
    })
], CompanyModule);
//# sourceMappingURL=company.module.js.map