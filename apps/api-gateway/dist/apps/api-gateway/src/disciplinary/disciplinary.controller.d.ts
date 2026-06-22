import { ClientGrpc } from '@nestjs/microservices';
export declare class DisciplinaryController {
    private readonly client;
    private caseService;
    private actService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    createCase(body: any): Promise<unknown>;
    listCases(query: any): Promise<unknown>;
    getCase(id: string): Promise<unknown>;
    updateCase(id: string, body: any): Promise<unknown>;
    createAction(body: any): Promise<unknown>;
    approveAction(id: string, body: any): Promise<unknown>;
    listActions(caseId: string): Promise<unknown>;
}
