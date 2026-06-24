import { Global, Module, DynamicModule, Provider } from '@nestjs/common';
import { createPrismaClient, DATABASE_URLS } from './prisma.config';

export const PRISMA_CLIENT = 'PRISMA_CLIENT';

export function prismaToken(serviceName: string): string {
  return `PRISMA_${serviceName.toUpperCase().replace(/-/g, '_')}_CLIENT`;
}

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

  static forServices(...serviceNames: string[]): DynamicModule {
    const providers = serviceNames.map((name) => ({
      provide: prismaToken(name),
      useFactory: () => createPrismaClient(name),
    }));

    return {
      module: PrismaModule,
      providers,
      exports: providers.map((p) => p.provide),
    };
  }
}

export function createServiceModule(
  serviceName: string,
  serviceProviders: Provider[],
): DynamicModule {
  const token = prismaToken(serviceName);

  const prismaAlias: Provider = {
    provide: PRISMA_CLIENT,
    useFactory: (client: any) => client,
    inject: [token],
  };

  return {
    module: class ServiceFeatureModule {},
    imports: [PrismaModule.forServices(serviceName)],
    providers: [prismaAlias, ...serviceProviders],
    exports: [...serviceProviders.map((p: any) => p.provide || p)],
  };
}

export { createPrismaClient, DATABASE_URLS };
