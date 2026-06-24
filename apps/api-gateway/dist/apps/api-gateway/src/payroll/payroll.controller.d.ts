import { PayrollRunService } from '../../../payroll-service/src/payroll-runs/payroll-runs.service';
import { AdvanceService } from '../../../payroll-service/src/salary-advance/salary-advance.service';
import { DeductionService } from '../../../payroll-service/src/deductions/deductions.service';
import { AllowanceService } from '../../../payroll-service/src/allowances/allowances.service';
import { BonusService } from '../../../payroll-service/src/bonuses/bonuses.service';
import { SettlementService } from '../../../payroll-service/src/settlements/settlements.service';
import { JournalService } from '../../../payroll-service/src/journal/journal.service';
export declare class PayrollController {
    private readonly runService;
    private readonly advService;
    private readonly dedService;
    private readonly alwService;
    private readonly bonService;
    private readonly setService;
    private readonly jService;
    constructor(runService: PayrollRunService, advService: AdvanceService, dedService: DeductionService, alwService: AllowanceService, bonService: BonusService, setService: SettlementService, jService: JournalService);
    generate(body: any): Promise<{
        id: any;
        companyId: any;
        period: any;
        month: any;
        year: any;
        employees: any;
        gross: any;
        net: any;
        paye: any;
        status: any;
        payDate: any;
        method: any;
        createdAt: any;
    }>;
    list(query: any): Promise<{
        runs: any;
        total: any;
    }>;
    getRun(id: string): Promise<{
        id: any;
        companyId: any;
        period: any;
        month: any;
        year: any;
        employees: any;
        gross: any;
        net: any;
        paye: any;
        status: any;
        payDate: any;
        method: any;
        createdAt: any;
    }>;
    getRunDetails(id: string): Promise<{
        run: {
            id: any;
            companyId: any;
            period: any;
            month: any;
            year: any;
            employees: any;
            gross: any;
            net: any;
            paye: any;
            status: any;
            payDate: any;
            method: any;
            createdAt: any;
        };
        rows: any;
        summary: {
            gross: any;
            net: any;
            paye: any;
            nssf: any;
            sdl: any;
            wcf: any;
            nhifEmployer: any;
            totalPayrollCost: any;
        };
        journal: {
            debits: {
                account: string;
                amount: number;
                type: string;
            }[];
            credits: {
                account: string;
                amount: number;
                type: string;
            }[];
            totalDebit: number;
            totalCredit: number;
        };
    }>;
    approveRun(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        period: any;
        month: any;
        year: any;
        employees: any;
        gross: any;
        net: any;
        paye: any;
        status: any;
        payDate: any;
        method: any;
        createdAt: any;
    }>;
    publish(id: string): Promise<{
        id: any;
        companyId: any;
        period: any;
        month: any;
        year: any;
        employees: any;
        gross: any;
        net: any;
        paye: any;
        status: any;
        payDate: any;
        method: any;
        createdAt: any;
    }>;
    createAdv(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        amount: any;
        termMonths: any;
        status: any;
        disbursedAt: any;
        notes: any;
    }>;
    listAdv(query: any): Promise<{
        advances: any;
    }>;
    createDed(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        code: any;
        amount: any;
        month: any;
        year: any;
        notes: any;
    }>;
    listDed(query: any): Promise<{
        deductions: any;
    }>;
    createAlw(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        code: any;
        amount: any;
        month: any;
        year: any;
        notes: any;
    }>;
    listAlw(query: any): Promise<{
        allowances: any;
    }>;
    createBon(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        amount: any;
        period: any;
        status: any;
        notes: any;
    }>;
    listBon(query: any): Promise<{
        bonuses: any;
    }>;
    createSet(body: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        amount: any;
        reason: any;
        effectiveDate: any;
        status: any;
        createdAt: any;
    }>;
    listSet(query: any): Promise<{
        settlements: any;
    }>;
    getJournal(query: any): Promise<{
        debits: {
            account: string;
            amount: number;
            type: string;
        }[];
        credits: {
            account: string;
            amount: number;
            type: string;
        }[];
        totalDebit: number;
        totalCredit: number;
        month: string;
        year: string;
    }>;
    exportJournal(body: any): Promise<{
        csv: string;
    }>;
}
