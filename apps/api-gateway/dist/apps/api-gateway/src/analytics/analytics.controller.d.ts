import { ClientGrpc } from '@nestjs/microservices';
export declare class AnalyticsController {
    private readonly client;
    private service;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    dashboard(companyId: string): Promise<unknown>;
    headcount(companyId: string): Promise<unknown>;
    attendance(companyId: string): Promise<unknown>;
    leave(companyId: string): Promise<unknown>;
    payroll(companyId: string): Promise<unknown>;
}
