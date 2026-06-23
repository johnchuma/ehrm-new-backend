"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings(companyId) {
        let settings = await this.prisma.companySettings.findUnique({ where: { companyId } });
        if (!settings) {
            settings = await this.prisma.companySettings.create({ data: { companyId } });
        }
        return {
            id: settings.id,
            companyId: settings.companyId,
            payrollCycle: settings.payrollCycle,
            leavePolicy: settings.leavePolicy,
            workHours: settings.workHours,
            overtimeRate: settings.overtimeRate,
            taxSettings: settings.taxSettings,
            notificationSettings: settings.notificationSettings,
            themeSettings: settings.themeSettings,
            generalSettings: settings.generalSettings,
        };
    }
    async updateSettings(companyId, data) {
        const settings = await this.prisma.companySettings.upsert({
            where: { companyId },
            update: data,
            create: { companyId, ...data },
        });
        return {
            id: settings.id,
            companyId: settings.companyId,
            payrollCycle: settings.payrollCycle,
            leavePolicy: settings.leavePolicy,
            workHours: settings.workHours,
            overtimeRate: settings.overtimeRate,
            taxSettings: settings.taxSettings,
            notificationSettings: settings.notificationSettings,
            themeSettings: settings.themeSettings,
            generalSettings: settings.generalSettings,
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], SettingsService);
//# sourceMappingURL=settings.service.js.map