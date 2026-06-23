import { CompanyService } from './companies.service';
export declare class CompanyController {
    private readonly service;
    constructor(service: CompanyService);
    create(data: any): Promise<{
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
    get(data: {
        id: string;
    }): Promise<{
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
    update(data: {
        id: string;
    } & any): Promise<{
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
    remove(data: {
        id: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    list(data: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
    }): Promise<{
        companies: any;
        total: any;
    }>;
}
