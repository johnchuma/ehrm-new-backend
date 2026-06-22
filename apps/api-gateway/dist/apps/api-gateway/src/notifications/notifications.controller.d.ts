import { ClientGrpc } from '@nestjs/microservices';
export declare class NotificationsController {
    private readonly client;
    private service;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    create(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    get(id: string): Promise<unknown>;
    markRead(id: string): Promise<unknown>;
    markAll(body: any): Promise<unknown>;
    remove(id: string): Promise<unknown>;
    unread(userId: string): Promise<unknown>;
}
