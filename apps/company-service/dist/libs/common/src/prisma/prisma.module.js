"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_URLS = exports.createPrismaClient = exports.PrismaModule = exports.PRISMA_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const prisma_config_1 = require("./prisma.config");
Object.defineProperty(exports, "createPrismaClient", { enumerable: true, get: function () { return prisma_config_1.createPrismaClient; } });
Object.defineProperty(exports, "DATABASE_URLS", { enumerable: true, get: function () { return prisma_config_1.DATABASE_URLS; } });
exports.PRISMA_CLIENT = 'PRISMA_CLIENT';
let PrismaModule = PrismaModule_1 = class PrismaModule {
    static forRoot(serviceName) {
        return {
            module: PrismaModule_1,
            providers: [
                {
                    provide: exports.PRISMA_CLIENT,
                    useFactory: () => (0, prisma_config_1.createPrismaClient)(serviceName),
                },
            ],
            exports: [exports.PRISMA_CLIENT],
        };
    }
};
exports.PrismaModule = PrismaModule;
exports.PrismaModule = PrismaModule = PrismaModule_1 = __decorate([
    (0, common_1.Global)()
], PrismaModule);
//# sourceMappingURL=prisma.module.js.map