export declare class EmergencyContactService {
    private readonly prisma;
    constructor(prisma: any);
    add(data: any): Promise<{
        id: any;
        employeeId: any;
        name: any;
        relationship: any;
        phone: any;
        altPhone: any;
    }>;
    list(employeeId: string): Promise<{
        contacts: any;
    }>;
    private toResponse;
}
