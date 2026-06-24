"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../../../libs/common/src/common.module");
const prisma_module_1 = require("../../../libs/common/src/prisma/prisma.module");
const transfers_service_1 = require("./transfers/transfers.service");
const promotions_service_1 = require("./promotions/promotions.service");
const SERVICE_NAME = 'movement';
let MovementModule = class MovementModule {
};
exports.MovementModule = MovementModule;
exports.MovementModule = MovementModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule.forServices(SERVICE_NAME)],
        providers: [
            { provide: prisma_module_1.PRISMA_CLIENT, useFactory: (c) => c, inject: [(0, prisma_module_1.prismaToken)(SERVICE_NAME)] },
            transfers_service_1.TransferService, promotions_service_1.PromotionService,
        ],
        exports: [transfers_service_1.TransferService, promotions_service_1.PromotionService],
    })
], MovementModule);
//# sourceMappingURL=movement.module.js.map