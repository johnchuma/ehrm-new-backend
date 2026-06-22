import { ClientGrpc } from '@nestjs/microservices';
export declare class DocumentsController {
    private readonly client;
    private service;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    upload(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    get(id: string): Promise<unknown>;
    update(id: string, body: any): Promise<unknown>;
    remove(id: string): Promise<unknown>;
    share(id: string, body: any): Promise<unknown>;
}
