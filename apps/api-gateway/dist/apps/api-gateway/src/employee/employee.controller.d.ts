import { ClientGrpc } from '@nestjs/microservices';
export declare class EmployeeController {
    private readonly client;
    private empService;
    private docService;
    private qualService;
    private ecService;
    private famService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    create(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    get(id: string): Promise<unknown>;
    getProfile(id: string): Promise<unknown>;
    update(id: string, body: any): Promise<unknown>;
    remove(id: string): Promise<unknown>;
    advance(id: string): Promise<unknown>;
    approve(id: string): Promise<unknown>;
    uploadDoc(body: any): Promise<unknown>;
    listDocs(employeeId: string): Promise<unknown>;
    addEdu(body: any): Promise<unknown>;
    addQual(body: any): Promise<unknown>;
    listEdu(employeeId: string): Promise<unknown>;
    listQuals(employeeId: string): Promise<unknown>;
    addEC(body: any): Promise<unknown>;
    listEC(employeeId: string): Promise<unknown>;
    addFam(body: any): Promise<unknown>;
    listFam(employeeId: string): Promise<unknown>;
}
