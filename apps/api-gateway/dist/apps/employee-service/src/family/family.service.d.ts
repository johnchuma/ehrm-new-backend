export declare class FamilyService {
    private readonly prisma;
    constructor(prisma: any);
    add(data: any): Promise<{
        id: any;
        employeeId: any;
        name: any;
        relationship: any;
        phone: any;
    }>;
    list(employeeId: string): Promise<{
        family: any;
    }>;
    private toResponse;
}
