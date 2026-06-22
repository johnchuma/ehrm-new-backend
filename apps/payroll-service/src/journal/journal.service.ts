import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class JournalService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async getJournal(data: { companyId: string; month?: string; year?: string; runId?: string }) {
    if (data.runId) {
      const run = await this.prisma.payrollRun.findUnique({
        where: { id: data.runId },
        include: { rows: true },
      });
      if (!run) throw GrpcErrors.NOT_FOUND('Payroll run not found');
      return this.buildJournal(run.rows, data.month || run.month, data.year || run.year);
    }

    const where: any = { companyId: data.companyId };
    if (data.month) where.month = data.month;
    if (data.year) where.year = data.year;
    const runs = await this.prisma.payrollRun.findMany({
      where,
      include: { rows: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    if (runs.length === 0) {
      return { debits: [], credits: [], totalDebit: 0, totalCredit: 0, month: data.month || '', year: data.year || '' };
    }
    return this.buildJournal(runs[0].rows, data.month || runs[0].month, data.year || runs[0].year);
  }

  async exportJournal(data: { companyId: string; month: string; year: string }) {
    const journal = await this.getJournal(data);
    const rows: string[][] = [['Date', 'Account', 'Currency', 'Debit', 'Credit']];
    const dateStr = `${data.month} ${data.year}`;
    journal.debits.forEach((d: any, i: number) => {
      rows.push([i === 0 ? dateStr : '', d.account, 'TZS', String(Math.round(d.amount)), '']);
    });
    journal.credits.forEach((c: any) => {
      rows.push(['', c.account, 'TZS', '', String(Math.round(c.amount))]);
    });
    rows.push(['', 'TOTAL', '', String(Math.round(journal.totalDebit)), String(Math.round(journal.totalCredit))]);
    return { csv: rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n') };
  }

  private buildJournal(rows: any[], month: string, year: string) {
    let gross = 0, paye = 0, nssf = 0, nhif = 0, sdl = 0, wcf = 0, net = 0, heslb = 0, salaryAdvance = 0;
    let employerNssf = 0, employerNhif = 0;
    rows.forEach((r) => {
      gross += r.grossSalary; paye += r.paye; nssf += r.nssf; nhif += r.nhif;
      sdl += r.sdl; wcf += r.wcf; net += r.netSalary; heslb += r.heslb;
      salaryAdvance += r.salaryAdvance; employerNssf += r.employerNssf; employerNhif += r.employerNhif;
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
    if (otherDeductions > 0) credits.push({ account: 'Other Deductions Payable', amount: otherDeductions, type: 'credit' });
    return {
      debits, credits,
      totalDebit: debits.reduce((s, d) => s + d.amount, 0),
      totalCredit: credits.reduce((s, c) => s + c.amount, 0),
      month, year,
    };
  }
}
