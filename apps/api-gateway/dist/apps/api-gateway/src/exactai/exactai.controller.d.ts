import { ClientGrpc } from '@nestjs/microservices';
export declare class ExactAIController {
    private readonly client;
    private service;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    chat(body: any): Promise<unknown>;
    summarize(employeeId: string): Promise<unknown>;
    insights(query: any): Promise<unknown>;
    predict(query: any): Promise<unknown>;
    recommend(body: any): Promise<unknown>;
}
