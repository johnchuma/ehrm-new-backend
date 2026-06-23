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
const prisma_module_1 = require("../../../libs/common/src/prisma/prisma.module");
const companies_controller_1 = require("./companies/companies.controller");
const branches_controller_1 = require("./branches/branches.controller");
const departments_controller_1 = require("./departments/departments.controller");
const settings_controller_1 = require("./settings/settings.controller");
const companies_service_1 = require("./companies/companies.service");
const branches_service_1 = require("./branches/branches.service");
const departments_service_1 = require("./departments/departments.service");
const settings_service_1 = require("./settings/settings.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule.forRoot('company')],
        controllers: [companies_controller_1.CompanyController, branches_controller_1.BranchController, departments_controller_1.DepartmentController, settings_controller_1.SettingsController],
        providers: [companies_service_1.CompanyService, branches_service_1.BranchService, departments_service_1.DepartmentService, settings_service_1.SettingsService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map