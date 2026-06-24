export declare class ContractService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        startDate: any;
        endDate: any;
        probationEndDate: any;
        basicSalary: any;
        terms: any;
        status: any;
        createdAt: any;
        terminatedAt: any;
    }>;
    get(id: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        startDate: any;
        endDate: any;
        probationEndDate: any;
        basicSalary: any;
        terms: any;
        status: any;
        createdAt: any;
        terminatedAt: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        startDate: any;
        endDate: any;
        probationEndDate: any;
        basicSalary: any;
        terms: any;
        status: any;
        createdAt: any;
        terminatedAt: any;
    }>;
    terminate(id: string, reason: string, terminationDate: string): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        startDate: any;
        endDate: any;
        probationEndDate: any;
        basicSalary: any;
        terms: any;
        status: any;
        createdAt: any;
        terminatedAt: any;
    }>;
    renew(id: string, newEndDate: string, newSalary: number): Promise<{
        id: any;
        companyId: any;
        employeeId: any;
        employeeName: any;
        type: any;
        startDate: any;
        endDate: any;
        probationEndDate: any;
        basicSalary: any;
        terms: any;
        status: any;
        createdAt: any;
        terminatedAt: any;
    }>;
    list(companyId: string, filters?: any): Promise<{
        contracts: any;
    }>;
    private toResponse;
}
