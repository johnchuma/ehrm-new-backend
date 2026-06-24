export declare class PayrollRunService {
    private readonly prisma;
    constructor(prisma: any);
    generate(data: {
        companyId: string;
        month: string;
        year: string;
        paymentMethod: string;
        payDate: string;
        cutoffDay?: number;
        employees?: any[];
    }): Promise<{
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
    get(id: string): Promise<{
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
    getDetails(id: string): Promise<{
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
    list(companyId: string, filters?: any): Promise<{
        runs: any;
        total: any;
    }>;
    approve(id: string, approverId: string): Promise<{
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
    publishPayslips(id: string): Promise<{
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
    private calculatePayrollRow;
    private buildJournal;
    private getEmployeesFromClient;
    private monthIndex;
    private toRunResponse;
    private toRowResponse;
}
