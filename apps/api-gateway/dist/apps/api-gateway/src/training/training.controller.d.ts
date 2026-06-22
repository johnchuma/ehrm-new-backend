import { ClientGrpc } from '@nestjs/microservices';
export declare class TrainingController {
    private readonly client;
    private progService;
    private enrService;
    private certService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    createProg(body: any): Promise<unknown>;
    listProgs(query: any): Promise<unknown>;
    getProg(id: string): Promise<unknown>;
    updateProg(id: string, body: any): Promise<unknown>;
    deleteProg(id: string): Promise<unknown>;
    enroll(body: any): Promise<unknown>;
    listEnr(query: any): Promise<unknown>;
    updateEnr(id: string, body: any): Promise<unknown>;
    issueCert(body: any): Promise<unknown>;
    listCerts(query: any): Promise<unknown>;
}
