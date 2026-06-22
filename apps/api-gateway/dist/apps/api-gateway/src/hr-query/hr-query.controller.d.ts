import { ClientGrpc } from '@nestjs/microservices';
export declare class HRQueryController {
    private readonly client;
    private queryService;
    private ticketService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    ask(body: any): Promise<unknown>;
    faqs(query: any): Promise<unknown>;
    createFaq(body: any): Promise<unknown>;
    listTickets(query: any): Promise<unknown>;
    createTicket(body: any): Promise<unknown>;
    reply(id: string, body: any): Promise<unknown>;
}
