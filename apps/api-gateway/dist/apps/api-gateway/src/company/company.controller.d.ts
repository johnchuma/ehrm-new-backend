import { ClientGrpc } from '@nestjs/microservices';
export declare class CompanyController {
    private readonly client;
    private companyService;
    private branchService;
    private departmentService;
    private settingsService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    createCompany(body: any): Promise<unknown>;
    listCompanies(query: any): Promise<unknown>;
    getCompany(id: string): Promise<unknown>;
    updateCompany(id: string, body: any): Promise<unknown>;
    deleteCompany(id: string): Promise<unknown>;
    createBranch(body: any): Promise<unknown>;
    listBranches(query: any): Promise<unknown>;
    getBranch(id: string): Promise<unknown>;
    updateBranch(id: string, body: any): Promise<unknown>;
    deleteBranch(id: string): Promise<unknown>;
    createDepartment(body: any): Promise<unknown>;
    listDepartments(query: any): Promise<unknown>;
    getDepartment(id: string): Promise<unknown>;
    updateDepartment(id: string, body: any): Promise<unknown>;
    deleteDepartment(id: string): Promise<unknown>;
    getSettings(companyId: string): Promise<unknown>;
    updateSettings(companyId: string, body: any): Promise<unknown>;
}
