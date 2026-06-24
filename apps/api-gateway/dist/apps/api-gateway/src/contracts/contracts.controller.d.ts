import { ContractService } from '../../../contracts-service/src/contracts/contracts.service';
export declare class ContractsController {
    private readonly service;
    constructor(service: ContractService);
    create(body: any): Promise<{
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
    list(query: any): Promise<{
        contracts: any;
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
    update(id: string, body: any): Promise<{
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
    terminate(id: string, body: any): Promise<{
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
    renew(id: string, body: any): Promise<{
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
}
