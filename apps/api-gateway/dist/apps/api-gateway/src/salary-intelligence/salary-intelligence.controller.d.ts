import { ClientGrpc } from '@nestjs/microservices';
export declare class SalaryIntelligenceController {
    private readonly client;
    private service;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    benchmarks(query: any): Promise<unknown>;
    compensation(query: any): Promise<unknown>;
    structure(companyId: string): Promise<unknown>;
    simulate(body: any): Promise<unknown>;
}
