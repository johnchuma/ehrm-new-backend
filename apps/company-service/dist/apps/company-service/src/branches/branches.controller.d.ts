import { BranchService } from './branches.service';
export declare class BranchController {
    private readonly service;
    constructor(service: BranchService);
    create(data: any): Promise<{
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
    get(data: {
        id: string;
    }): Promise<{
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
    update(data: {
        id: string;
    } & any): Promise<{
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
    remove(data: {
        id: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    list(data: {
        companyId: string;
    }): Promise<{
        branches: any;
    }>;
}
