"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenefitsModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../../../libs/common/src/common.module");
const prisma_module_1 = require("../../../libs/common/src/prisma/prisma.module");
const benefits_service_1 = require("./benefits/benefits.service");
const enrollments_service_1 = require("./enrollments/enrollments.service");
const SERVICE_NAME = 'benefits';
let BenefitsModule = class BenefitsModule {
};
exports.BenefitsModule = BenefitsModule;
exports.BenefitsModule = BenefitsModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule.forServices(SERVICE_NAME)],
        providers: [
            { provide: prisma_module_1.PRISMA_CLIENT, useFactory: (c) => c, inject: [(0, prisma_module_1.prismaToken)(SERVICE_NAME)] },
            benefits_service_1.BenefitService, enrollments_service_1.EnrollmentService,
        ],
        exports: [benefits_service_1.BenefitService, enrollments_service_1.EnrollmentService],
    })
], BenefitsModule);
//# sourceMappingURL=benefits.module.js.map