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
exports.PayrollRunService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let PayrollRunService = class PayrollRunService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generate(data) {
        const runId = `PR-${data.year}-${String(this.monthIndex(data.month) + 1).padStart(2, '0')}`;
        const period = `${data.month} ${data.year}`;
        const employees = data.employees || await this.getEmployeesFromClient(data.companyId);
        const rows = [];
        let totalGross = 0, totalNet = 0, totalPaye = 0, totalNssf = 0, totalSdl = 0, totalWcf = 0, totalNhif = 0;
        for (let i = 0; i < employees.length; i++) {
            const emp = employees[i];
            const row = this.calculatePayrollRow(emp, i, runId);
            rows.push(row);
            totalGross += row.grossSalary;
            totalNet += row.netSalary;
            totalPaye += row.paye;
            totalNssf += row.nssf;
            totalSdl += row.sdl;
            totalWcf += row.wcf;
            totalNhif += row.nhif;
        }
        const totalCost = totalGross + totalNssf + totalSdl + totalWcf + totalNhif;
        const existing = await this.prisma.payrollRun.findFirst({ where: { id: runId } });
        if (existing) {
            await this.prisma.payrollRow.deleteMany({ where: { runId } });
            await this.prisma.payrollRun.delete({ where: { id: runId } });
        }
        const run = await this.prisma.payrollRun.create({
            data: {
                id: runId,
                companyId: data.companyId,
                period,
                month: data.month,
                year: data.year,
                employees: rows.length,
                gross: totalGross,
                net: totalNet,
                paye: totalPaye,
                nssf: totalNssf,
                sdl: totalSdl,
                wcf: totalWcf,
                nhif: totalNhif,
                totalCost,
                status: 'PENDING_APPROVAL',
                payDate: new Date(data.payDate),
                method: data.paymentMethod,
                rows: { create: rows },
            },
            include: { rows: true },
        });
        return this.toRunResponse(run);
    }
    async get(id) {
        const run = await this.prisma.payrollRun.findUnique({ where: { id } });
        if (!run)
            throw decorators_1.GrpcErrors.NOT_FOUND('Payroll run not found');
        return this.toRunResponse(run);
    }
    async getDetails(id) {
        const run = await this.prisma.payrollRun.findUnique({
            where: { id },
            include: { rows: true },
        });
        if (!run)
            throw decorators_1.GrpcErrors.NOT_FOUND('Payroll run not found');
        const summary = {
            gross: run.gross,
            net: run.net,
            paye: run.paye,
            nssf: run.nssf,
            sdl: run.sdl,
            wcf: run.wcf,
            nhifEmployer: run.nhif,
            totalPayrollCost: run.totalCost,
        };
        const journal = this.buildJournal(run.rows);
        return {
            run: this.toRunResponse(run),
            rows: run.rows.map((r) => this.toRowResponse(r)),
            summary,
            journal,
        };
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.year)
            where.year = filters.year;
        if (filters.status)
            where.status = filters.status;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const [runs, total] = await Promise.all([
            this.prisma.payrollRun.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payrollRun.count({ where }),
        ]);
        return { runs: runs.map((r) => this.toRunResponse(r)), total };
    }
    async approve(id, approverId) {
        const run = await this.prisma.payrollRun.update({
            where: { id },
            data: { status: 'APPROVED', approverId, approvedAt: new Date() },
        });
        return this.toRunResponse(run);
    }
    async publishPayslips(id) {
        const run = await this.prisma.payrollRun.update({
            where: { id },
            data: { status: 'PUBLISHED', publishedAt: new Date() },
        });
        return this.toRunResponse(run);
    }
    calculatePayrollRow(emp, index, runId) {
        const basicSalary = Math.round((emp.grossSalary || emp.gross || 1200000) * (0.94 + (index % 12) * 0.008));
        const nightAllowance = index % 5 === 0 ? Math.round(basicSalary * 0.05) : 0;
        const terminationAmount = index % 11 === 0 ? Math.round(basicSalary * 0.08) : 0;
        const allowances = Math.round(basicSalary * (0.08 + (index % 4) * 0.01));
        const overtime = Math.round(basicSalary * (0.01 + (index % 3) * 0.003));
        const grossSalary = basicSalary + nightAllowance + terminationAmount + allowances + overtime;
        const nssf = Math.round(basicSalary * 0.1);
        const paye = Math.round(grossSalary * 0.13);
        const nhif = Math.round(grossSalary * 0.03);
        const heslb = index % 7 === 0 ? Math.round(grossSalary * 0.04) : 0;
        const salaryAdvance = index % 6 === 0 ? Math.round(grossSalary * 0.02) : 0;
        const otherDeduction = index % 8 === 0 ? Math.round(grossSalary * 0.01) : 0;
        const totalDeduction = nssf + paye + nhif + heslb + salaryAdvance + otherDeduction;
        const netSalary = Math.max(0, grossSalary - totalDeduction);
        const employerNssf = nssf;
        const sdl = Math.round(grossSalary * 0.035);
        const wcf = Math.round(grossSalary * 0.005);
        const employerNhif = nhif;
        const totalPayrollCost = grossSalary + employerNssf + sdl + wcf + employerNhif;
        return {
            runId,
            employeeId: emp.id,
            employeeName: emp.fullName || emp.name,
            designation: emp.jobTitle || emp.title || '',
            workingDays: 26 - (index % 3),
            basicSalary, nightAllowance, terminationAmount, allowances, overtime,
            grossSalary, nssf, paye, nhif, heslb, salaryAdvance, otherDeduction,
            totalDeduction, netSalary, employerNssf, employerNhif, sdl, wcf, totalPayrollCost,
        };
    }
    buildJournal(rows) {
        let gross = 0, paye = 0, nssf = 0, nhif = 0, sdl = 0, wcf = 0, net = 0, heslb = 0, salaryAdvance = 0;
        let employerNssf = 0, employerNhif = 0;
        rows.forEach((r) => {
            gross += r.grossSalary;
            paye += r.paye;
            nssf += r.nssf;
            nhif += r.nhif;
            sdl += r.sdl;
            wcf += r.wcf;
            net += r.netSalary;
            heslb += r.heslb;
            salaryAdvance += r.salaryAdvance;
            employerNssf += r.employerNssf;
            employerNhif += r.employerNhif;
        });
        const otherDeductions = Math.max(0, gross - net - paye - nssf - heslb - salaryAdvance);
        const debits = [
            { account: 'Salaries / Wages', amount: gross, type: 'debit' },
            { account: 'NSSF Expenses', amount: employerNssf, type: 'debit' },
            { account: 'SDL Expenses', amount: sdl, type: 'debit' },
            { account: 'WCF Expenses', amount: wcf, type: 'debit' },
            { account: 'NHIF Expenses', amount: nhif + employerNhif, type: 'debit' },
        ];
        const credits = [
            { account: 'Advance Salary', amount: salaryAdvance, type: 'credit' },
            { account: 'Net Salary Payable', amount: net, type: 'credit' },
            { account: 'NSSF Payable', amount: nssf + employerNssf, type: 'credit' },
            { account: 'PAYE Payable', amount: paye, type: 'credit' },
            { account: 'NHIF Payable', amount: nhif + employerNhif, type: 'credit' },
            { account: 'HESLB Payable', amount: heslb, type: 'credit' },
            { account: 'WCF Payable', amount: wcf, type: 'credit' },
            { account: 'SDL Payable', amount: sdl, type: 'credit' },
        ];
        if (otherDeductions > 0)
            credits.push({ account: 'Other Deductions Payable', amount: otherDeductions, type: 'credit' });
        return {
            debits,
            credits,
            totalDebit: debits.reduce((s, d) => s + d.amount, 0),
            totalCredit: credits.reduce((s, c) => s + c.amount, 0),
        };
    }
    async getEmployeesFromClient(companyId) {
        return [
            { id: 'EMP1001', fullName: 'Joyce Massawe', jobTitle: 'HR Manager', grossSalary: 2500000 },
            { id: 'EMP1002', fullName: 'Frank Shayo', jobTitle: 'Operations Manager', grossSalary: 2200000 },
            { id: 'EMP1003', fullName: 'Asha Mrema', jobTitle: 'Payroll Officer', grossSalary: 1800000 },
            { id: 'EMP1004', fullName: 'Neema Kimaro', jobTitle: 'Software Engineer', grossSalary: 2000000 },
            { id: 'EMP1005', fullName: 'Amani Kikwete', jobTitle: 'Accountant', grossSalary: 1600000 },
            { id: 'EMP1006', fullName: 'Grace Mushi', jobTitle: 'Sales Executive', grossSalary: 1500000 },
            { id: 'EMP1007', fullName: 'Joseph Mwanga', jobTitle: 'Driver', grossSalary: 800000 },
            { id: 'EMP1008', fullName: 'Rahel Sanga', jobTitle: 'Receptionist', grossSalary: 900000 },
            { id: 'EMP1009', fullName: 'Peter Mosha', jobTitle: 'IT Support', grossSalary: 1400000 },
            { id: 'EMP1010', fullName: 'Mary Kitua', jobTitle: 'Marketing Officer', grossSalary: 1700000 },
        ];
    }
    monthIndex(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(month);
    }
    toRunResponse(r) {
        return {
            id: r.id, companyId: r.companyId, period: r.period,
            month: r.month, year: r.year, employees: r.employees,
            gross: r.gross, net: r.net, paye: r.paye, status: r.status,
            payDate: r.payDate?.toISOString() || '', method: r.method,
            createdAt: r.createdAt?.toISOString() || '',
        };
    }
    toRowResponse(r) {
        return {
            id: r.id, employeeId: r.employeeId, employeeName: r.employeeName,
            designation: r.designation, workingDays: r.workingDays,
            basicSalary: r.basicSalary, nightAllowance: r.nightAllowance,
            terminationAmount: r.terminationAmount, allowances: r.allowances,
            overtime: r.overtime, grossSalary: r.grossSalary,
            nssf: r.nssf, paye: r.paye, nhif: r.nhif, heslb: r.heslb,
            salaryAdvance: r.salaryAdvance, otherDeduction: r.otherDeduction,
            totalDeduction: r.totalDeduction, netSalary: r.netSalary,
            employerNssf: r.employerNssf, sdl: r.sdl, wcf: r.wcf,
            employerNhif: r.employerNhif, totalPayrollCost: r.totalPayrollCost,
        };
    }
};
exports.PayrollRunService = PayrollRunService;
exports.PayrollRunService = PayrollRunService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], PayrollRunService);
//# sourceMappingURL=payroll-runs.service.js.map