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
exports.SalaryIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
let SalaryIntelligenceService = class SalaryIntelligenceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBenchmarks(companyId, jobTitle, department) {
        return {
            jobTitle,
            department,
            marketMin: 1500000,
            marketMedian: 2200000,
            marketMax: 3500000,
            companyAverage: 2100000,
            percentile: 55,
            recommendation: 'Your current salary is at the 55th percentile. Consider a 10% adjustment to align with market median.',
        };
    }
    async getCompensationAnalysis(companyId, departmentId) {
        return {
            department: 'Operations',
            employees: 320,
            averageSalary: 1812500,
            medianSalary: 1700000,
            minSalary: 800000,
            maxSalary: 4500000,
            totalCost: 580000000,
            gradeDistribution: [
                { grade: 'G1', count: 15, average: 4200000 },
                { grade: 'G2', count: 35, average: 3200000 },
                { grade: 'G3', count: 120, average: 2200000 },
                { grade: 'G4', count: 100, average: 1400000 },
                { grade: 'G5', count: 50, average: 900000 },
            ],
        };
    }
    async getSalaryStructure(companyId) {
        return {
            grades: [
                { grade: 'G1', level: 'Senior Management', minSalary: 3500000, midSalary: 4500000, maxSalary: 6000000, description: 'Directors, Senior Managers' },
                { grade: 'G2', level: 'Middle Management', minSalary: 2500000, midSalary: 3200000, maxSalary: 4000000, description: 'Managers, Department Heads' },
                { grade: 'G3', level: 'Senior Professional', minSalary: 1800000, midSalary: 2200000, maxSalary: 2800000, description: 'Senior Officers, Specialists' },
                { grade: 'G4', level: 'Professional', minSalary: 1200000, midSalary: 1500000, maxSalary: 2000000, description: 'Officers, Assistants' },
                { grade: 'G5', level: 'Support', minSalary: 700000, midSalary: 900000, maxSalary: 1200000, description: 'Support Staff, Operators' },
            ],
        };
    }
    async simulateSalary(companyId, employeeId, proposedSalary) {
        const currentSalary = 1800000;
        const increase = proposedSalary - currentSalary;
        const increasePercent = (increase / currentSalary) * 100;
        return {
            employeeId,
            currentSalary,
            proposedSalary,
            increase,
            increasePercent: Math.round(increasePercent * 100) / 100,
            monthlyImpact: increase,
            annualImpact: increase * 12,
            recommendation: increasePercent > 15 ? 'Consider phased implementation to manage budget impact.' : 'Within reasonable adjustment range.',
        };
    }
};
exports.SalaryIntelligenceService = SalaryIntelligenceService;
exports.SalaryIntelligenceService = SalaryIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], SalaryIntelligenceService);
//# sourceMappingURL=salary-intelligence.service.js.map