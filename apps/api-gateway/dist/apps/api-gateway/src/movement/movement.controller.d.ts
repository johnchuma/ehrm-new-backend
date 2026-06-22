import { ClientGrpc } from '@nestjs/microservices';
export declare class MovementController {
    private readonly client;
    private trService;
    private prService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    createTr(body: any): Promise<unknown>;
    listTr(query: any): Promise<unknown>;
    approveTr(id: string, body: any): Promise<unknown>;
    createPr(body: any): Promise<unknown>;
    listPr(query: any): Promise<unknown>;
    approvePr(id: string, body: any): Promise<unknown>;
}
