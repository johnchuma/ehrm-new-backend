export declare class AppController {
    root(): {
        name: string;
        version: string;
        description: string;
        services: {
            name: string;
            port: number;
            path: string;
            description: string;
        }[];
        endpoints: {
            health: string;
            services: string;
            docs: string;
            swagger: string;
        };
    };
    health(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
    services(): {
        total: number;
        services: {
            name: string;
            port: number;
            path: string;
            description: string;
        }[];
    };
    private getServicesInfo;
}
