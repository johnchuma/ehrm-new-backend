import { ClientGrpc } from '@nestjs/microservices';
export declare class IntegrationsController {
    private readonly client;
    private intService;
    private whService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    create(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    update(id: string, body: any): Promise<unknown>;
    remove(id: string): Promise<unknown>;
    toggle(id: string, body: any): Promise<unknown>;
    createWh(body: any): Promise<unknown>;
    listWh(query: any): Promise<unknown>;
    removeWh(id: string): Promise<unknown>;
}
