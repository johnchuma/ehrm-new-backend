import { ClientGrpc } from '@nestjs/microservices';
export declare class OffboardingController {
    private readonly client;
    private offService;
    private clrService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    create(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    get(id: string): Promise<unknown>;
    update(id: string, body: any): Promise<unknown>;
    advance(id: string, body: any): Promise<unknown>;
    complete(id: string): Promise<unknown>;
    createClr(body: any): Promise<unknown>;
    listClr(offboardingId: string): Promise<unknown>;
    approveClr(id: string, body: any): Promise<unknown>;
}
