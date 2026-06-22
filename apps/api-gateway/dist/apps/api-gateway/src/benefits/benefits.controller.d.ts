import { ClientGrpc } from '@nestjs/microservices';
export declare class BenefitsController {
    private readonly client;
    private benService;
    private enrService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    create(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    get(id: string): Promise<unknown>;
    update(id: string, body: any): Promise<unknown>;
    remove(id: string): Promise<unknown>;
    enroll(body: any): Promise<unknown>;
    listEnr(query: any): Promise<unknown>;
}
