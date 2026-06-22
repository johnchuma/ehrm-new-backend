import { ClientGrpc } from '@nestjs/microservices';
export declare class OnboardingController {
    private readonly client;
    private onbService;
    private taskService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    create(body: any): Promise<unknown>;
    list(query: any): Promise<unknown>;
    get(id: string): Promise<unknown>;
    update(id: string, body: any): Promise<unknown>;
    advance(id: string, body: any): Promise<unknown>;
    complete(id: string): Promise<unknown>;
    createTask(body: any): Promise<unknown>;
    listTasks(onboardingId: string): Promise<unknown>;
    completeTask(id: string): Promise<unknown>;
}
