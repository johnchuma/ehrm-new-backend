import { ClientGrpc } from '@nestjs/microservices';
export declare class PerformanceController {
    private readonly client;
    private revService;
    private goalService;
    private kpiService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    createRev(body: any): Promise<unknown>;
    listRev(query: any): Promise<unknown>;
    getRev(id: string): Promise<unknown>;
    updateRev(id: string, body: any): Promise<unknown>;
    submitRev(id: string): Promise<unknown>;
    createGoal(body: any): Promise<unknown>;
    listGoals(query: any): Promise<unknown>;
    getGoal(id: string): Promise<unknown>;
    updateGoal(id: string, body: any): Promise<unknown>;
    deleteGoal(id: string): Promise<unknown>;
    createKpi(body: any): Promise<unknown>;
    listKpis(query: any): Promise<unknown>;
    updateKpi(id: string, body: any): Promise<unknown>;
}
