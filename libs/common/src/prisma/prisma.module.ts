import { Global, Module, DynamicModule } from '@nestjs/common';
import { createPrismaClient, DATABASE_URLS } from './prisma.config';

export const PRISMA_CLIENT = 'PRISMA_CLIENT';

@Global()
export class PrismaModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_CLIENT,
          useFactory: () => createPrismaClient(serviceName),
        },
      ],
      exports: [PRISMA_CLIENT],
    };
  }
}

export { createPrismaClient, DATABASE_URLS };
