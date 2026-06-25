import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DemoModule } from './modules/demo/demo.module';
import { AiModule } from './modules/ai/ai.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { SuperAdminModule } from './super-admin/super-admin.module';

import { IamController } from './modules/auth/iam.controller';

import { TenantMiddleware } from './common/tenant/tenant.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'ehrm-super-secret-key-2026',
    }),
    PrismaModule,
    AuthModule,
    CompanyModule,
    SubscriptionsModule,
    DemoModule,
    AiModule,
    BootstrapModule,
    SuperAdminModule,
  ],
  controllers: [IamController],
  providers: [
    { provide: APP_FILTER,      useClass: GlobalExceptionFilter },
    { provide: APP_GUARD,       useClass: JwtAuthGuard },
    { provide: APP_GUARD,       useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Runs on every request before guards — sets tenant context from JWT
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
