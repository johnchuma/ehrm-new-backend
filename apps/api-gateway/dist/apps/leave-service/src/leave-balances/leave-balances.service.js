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
exports.LeaveBalanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let LeaveBalanceService = class LeaveBalanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalance(employeeId, leaveTypeId) {
        const balance = await this.prisma.leaveBalance.findFirst({
            where: { employeeId, leaveTypeId },
            include: { leaveType: true },
        });
        if (!balance) {
            const type = await this.prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
            if (!type)
                throw decorators_1.GrpcErrors.NOT_FOUND('Leave type not found');
            return {
                id: '', employeeId, leaveTypeId,
                leaveTypeName: type.name,
                opening: 0, accrued: type.entitlementDays,
                used: 0, available: type.entitlementDays, year: String(new Date().getFullYear()),
            };
        }
        return this.toResponse(balance);
    }
    async listBalances(companyId, employeeId) {
        const where = {};
        if (employeeId)
            where.employeeId = employeeId;
        const balances = await this.prisma.leaveBalance.findMany({
            where,
            include: { leaveType: true },
        });
        return { balances: balances.map((b) => this.toResponse(b)) };
    }
    async accrue(data) {
        const year = data.year || String(new Date().getFullYear());
        const balance = await this.prisma.leaveBalance.upsert({
            where: { employeeId_leaveTypeId_year: { employeeId: data.employeeId, leaveTypeId: data.leaveTypeId, year } },
            update: { accrued: { increment: data.days }, available: { increment: data.days } },
            create: {
                employeeId: data.employeeId,
                leaveTypeId: data.leaveTypeId,
                year,
                accrued: data.days,
                available: data.days,
            },
            include: { leaveType: true },
        });
        return this.toResponse(balance);
    }
    async getLiability(companyId) {
        const balances = await this.prisma.leaveBalance.findMany({
            include: { leaveType: true },
        });
        const employees = new Map();
        let totalLiability = 0;
        let totalEncashmentExposure = 0;
        const byDept = new Map();
        balances.forEach((b) => {
            const key = b.employeeId;
            const val = b.available * 50000;
            totalLiability += val;
            totalEncashmentExposure += val * 0.5;
            const cur = employees.get(key) || 0;
            employees.set(key, cur + 1);
        });
        const items = Array.from(employees.entries()).map(([empId, count]) => {
            const empBalances = balances.filter((b) => b.employeeId === empId);
            const totalDays = empBalances.reduce((s, b) => s + b.available, 0);
            const liability = totalDays * 50000;
            return {
                department: `Employee ${empId.slice(-4)}`,
                headcount: count,
                totalDays,
                liability,
                encashmentExposure: liability * 0.5,
            };
        });
        return {
            items,
            totalLiability,
            totalEncashmentExposure,
        };
    }
    toResponse(b) {
        return {
            id: b.id, employeeId: b.employeeId, leaveTypeId: b.leaveTypeId,
            leaveTypeName: b.leaveType?.name || '',
            opening: b.opening, accrued: b.accrued, used: b.used, available: b.available,
            year: b.year,
        };
    }
};
exports.LeaveBalanceService = LeaveBalanceService;
exports.LeaveBalanceService = LeaveBalanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], LeaveBalanceService);
//# sourceMappingURL=leave-balances.service.js.map