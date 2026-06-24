import { CompanyService } from '../../../company-service/src/companies/companies.service';
import { BranchService } from '../../../company-service/src/branches/branches.service';
import { DepartmentService } from '../../../company-service/src/departments/departments.service';
import { SettingsService } from '../../../company-service/src/settings/settings.service';
export declare class CompanyController {
    private readonly companyService;
    private readonly branchService;
    private readonly departmentService;
    private readonly settingsService;
    constructor(companyService: CompanyService, branchService: BranchService, departmentService: DepartmentService, settingsService: SettingsService);
    createCompany(body: any): Promise<{
        id: any;
        name: any;
        slug: any;
        email: any;
        phone: any;
        address: any;
        country: any;
        currency: any;
        timezone: any;
        logo: any;
        subscriptionPlan: any;
        industry: any;
        size: any;
        website: any;
        taxId: any;
        registrationNumber: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    listCompanies(query: any): Promise<{
        companies: any;
        total: any;
    }>;
    getCompany(id: string): Promise<{
        id: any;
        name: any;
        slug: any;
        email: any;
        phone: any;
        address: any;
        country: any;
        currency: any;
        timezone: any;
        logo: any;
        subscriptionPlan: any;
        industry: any;
        size: any;
        website: any;
        taxId: any;
        registrationNumber: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    updateCompany(id: string, body: any): Promise<{
        id: any;
        name: any;
        slug: any;
        email: any;
        phone: any;
        address: any;
        country: any;
        currency: any;
        timezone: any;
        logo: any;
        subscriptionPlan: any;
        industry: any;
        size: any;
        website: any;
        taxId: any;
        registrationNumber: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    deleteCompany(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createBranch(body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        code: any;
        address: any;
        city: any;
        country: any;
        phone: any;
        email: any;
        managerId: any;
        isActive: any;
        createdAt: any;
    }>;
    listBranches(query: any): Promise<{
        branches: any;
    }>;
    getBranch(id: string): Promise<{
        id: any;
        companyId: any;
        name: any;
        code: any;
        address: any;
        city: any;
        country: any;
        phone: any;
        email: any;
        managerId: any;
        isActive: any;
        createdAt: any;
    }>;
    updateBranch(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        code: any;
        address: any;
        city: any;
        country: any;
        phone: any;
        email: any;
        managerId: any;
        isActive: any;
        createdAt: any;
    }>;
    deleteBranch(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createDepartment(body: any): Promise<{
        id: any;
        companyId: any;
        branchId: any;
        name: any;
        code: any;
        description: any;
        headId: any;
        parentId: any;
        isActive: any;
        createdAt: any;
    }>;
    listDepartments(query: any): Promise<{
        departments: any;
    }>;
    getDepartment(id: string): Promise<{
        id: any;
        companyId: any;
        branchId: any;
        name: any;
        code: any;
        description: any;
        headId: any;
        parentId: any;
        isActive: any;
        createdAt: any;
    }>;
    updateDepartment(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        branchId: any;
        name: any;
        code: any;
        description: any;
        headId: any;
        parentId: any;
        isActive: any;
        createdAt: any;
    }>;
    deleteDepartment(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSettings(companyId: string): Promise<{
        id: any;
        companyId: any;
        payrollCycle: any;
        leavePolicy: any;
        workHours: any;
        overtimeRate: any;
        taxSettings: any;
        notificationSettings: any;
        themeSettings: any;
        generalSettings: any;
    }>;
    updateSettings(companyId: string, body: any): Promise<{
        id: any;
        companyId: any;
        payrollCycle: any;
        leavePolicy: any;
        workHours: any;
        overtimeRate: any;
        taxSettings: any;
        notificationSettings: any;
        themeSettings: any;
        generalSettings: any;
    }>;
}
