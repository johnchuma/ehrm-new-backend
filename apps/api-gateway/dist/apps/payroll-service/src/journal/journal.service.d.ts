export declare class JournalService {
    private readonly prisma;
    constructor(prisma: any);
    getJournal(data: {
        companyId: string;
        month?: string;
        year?: string;
        runId?: string;
    }): Promise<{
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
    exportJournal(data: {
        companyId: string;
        month: string;
        year: string;
    }): Promise<{
        csv: string;
    }>;
    private buildJournal;
}
