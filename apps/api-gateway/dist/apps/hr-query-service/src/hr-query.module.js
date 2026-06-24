"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRQueryModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../../../libs/common/src/common.module");
const prisma_module_1 = require("../../../libs/common/src/prisma/prisma.module");
const hr_query_service_1 = require("./hr-query/hr-query.service");
const tickets_service_1 = require("./tickets/tickets.service");
const SERVICE_NAME = 'hr-query';
let HRQueryModule = class HRQueryModule {
};
exports.HRQueryModule = HRQueryModule;
exports.HRQueryModule = HRQueryModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule.forServices(SERVICE_NAME)],
        providers: [
            { provide: prisma_module_1.PRISMA_CLIENT, useFactory: (c) => c, inject: [(0, prisma_module_1.prismaToken)(SERVICE_NAME)] },
            hr_query_service_1.HRQueryService, tickets_service_1.TicketService,
        ],
        exports: [hr_query_service_1.HRQueryService, tickets_service_1.TicketService],
    })
], HRQueryModule);
//# sourceMappingURL=hr-query.module.js.map