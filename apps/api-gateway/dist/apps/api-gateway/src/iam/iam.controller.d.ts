import { ClientGrpc } from '@nestjs/microservices';
export declare class IamController {
    private readonly client;
    private userService;
    private roleService;
    constructor(client: ClientGrpc);
    onModuleInit(): void;
    createUser(body: any): Promise<unknown>;
    listUsers(query: any): Promise<unknown>;
    getUser(id: string): Promise<unknown>;
    updateUser(id: string, body: any): Promise<unknown>;
    deleteUser(id: string): Promise<unknown>;
    assignRole(userId: string, roleId: string): Promise<unknown>;
    removeRole(userId: string, roleId: string): Promise<unknown>;
    createRole(body: any): Promise<unknown>;
    listRoles(query: any): Promise<unknown>;
    getRole(id: string): Promise<unknown>;
    updateRole(id: string, body: any): Promise<unknown>;
    deleteRole(id: string): Promise<unknown>;
}
