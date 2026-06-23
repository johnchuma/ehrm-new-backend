import { DynamicModule } from '@nestjs/common';
import { createPrismaClient, DATABASE_URLS } from './prisma.config';
export declare const PRISMA_CLIENT = "PRISMA_CLIENT";
export declare class PrismaModule {
    static forRoot(serviceName: string): DynamicModule;
}
export { createPrismaClient, DATABASE_URLS };
