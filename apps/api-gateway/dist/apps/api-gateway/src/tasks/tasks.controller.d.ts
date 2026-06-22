import { ClientGrpc } from '@nestjs/microservices';
export declare class TasksController {
    private readonly client;
    private service;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    create(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    get(id: string): Promise<unknown>;
    update(id: string, body: any): Promise<unknown>;
    remove(id: string): Promise<unknown>;
    assign(id: string, body: any): Promise<unknown>;
    complete(id: string): Promise<unknown>;
}
