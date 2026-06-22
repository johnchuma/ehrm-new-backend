import { ClientGrpc } from '@nestjs/microservices';
export declare class AssetsController {
    private readonly client;
    private assetService;
    private assignService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    create(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    get(id: string): Promise<unknown>;
    update(id: string, body: any): Promise<unknown>;
    remove(id: string): Promise<unknown>;
    assign(body: any): Promise<unknown>;
    return(id: string, body: any): Promise<unknown>;
    listAssign(query: any): Promise<unknown>;
}
