export declare class CompanyService {
    private readonly prisma;
    constructor(prisma: any);
    createCompany(data: any): Promise<{
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
    updateCompany(id: string, data: any): Promise<{
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
    listCompanies(page?: number, pageSize?: number, search?: string, status?: string): Promise<{
        companies: any;
        total: any;
    }>;
    private toCompanyResponse;
}
