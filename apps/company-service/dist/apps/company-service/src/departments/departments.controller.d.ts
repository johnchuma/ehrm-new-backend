import { DepartmentService } from './departments.service';
export declare class DepartmentController {
    private readonly service;
    constructor(service: DepartmentService);
    create(data: any): Promise<{
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
    get(data: {
        id: string;
    }): Promise<{
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
    update(data: {
        id: string;
    } & any): Promise<{
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
    remove(data: {
        id: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    list(data: {
        companyId: string;
        branchId?: string;
    }): Promise<{
        departments: any;
    }>;
}
