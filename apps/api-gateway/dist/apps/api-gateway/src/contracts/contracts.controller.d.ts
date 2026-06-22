import { ClientGrpc } from '@nestjs/microservices';
export declare class ContractsController {
    private readonly client;
    private service;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    create(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    get(id: string): Promise<unknown>;
    update(id: string, body: any): Promise<unknown>;
    terminate(id: string, body: any): Promise<unknown>;
    renew(id: string, body: any): Promise<unknown>;
}
