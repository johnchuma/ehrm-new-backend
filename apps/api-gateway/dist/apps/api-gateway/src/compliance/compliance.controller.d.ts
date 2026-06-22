import { ClientGrpc } from '@nestjs/microservices';
export declare class ComplianceController {
    private readonly client;
    private compService;
    private statService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    createReq(body: any): Promise<unknown>;
    listReq(query: any): Promise<unknown>;
    updateReq(id: string, body: any): Promise<unknown>;
    createFiling(body: any): Promise<unknown>;
    listFilings(query: any): Promise<unknown>;
    updateFiling(id: string, body: any): Promise<unknown>;
}
