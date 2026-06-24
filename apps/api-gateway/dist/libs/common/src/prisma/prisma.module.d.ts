import { DynamicModule, Provider } from '@nestjs/common';
import { createPrismaClient, DATABASE_URLS } from './prisma.config';
export declare const PRISMA_CLIENT = "PRISMA_CLIENT";
export declare function prismaToken(serviceName: string): string;
export declare class PrismaModule {
    static forRoot(serviceName: string): DynamicModule;
    static forServices(...serviceNames: string[]): DynamicModule;
}
export declare function createServiceModule(serviceName: string, serviceProviders: Provider[]): DynamicModule;
export { createPrismaClient, DATABASE_URLS };
