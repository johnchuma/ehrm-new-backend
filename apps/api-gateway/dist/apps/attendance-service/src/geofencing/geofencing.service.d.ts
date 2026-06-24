export declare class GeofenceService {
    private readonly prisma;
    constructor(prisma: any);
    create(data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        lat: any;
        lng: any;
        radius: any;
        branchIds: any;
        status: any;
    }>;
    update(id: string, data: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        lat: any;
        lng: any;
        radius: any;
        branchIds: any;
        status: any;
    }>;
    list(companyId: string): Promise<{
        geofences: any;
    }>;
    private toResponse;
}
