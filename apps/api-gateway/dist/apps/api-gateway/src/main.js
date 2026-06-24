"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalGuards(app.get(jwt_auth_guard_1.JwtAuthGuard));
    app.enableCors({ origin: '*', credentials: true });
    app.setGlobalPrefix('api/v1');
    const swaggerCustomOptions = {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
            syntaxHighlight: { theme: 'monokai' },
        },
        customSiteTitle: 'ExactEHRM API Documentation',
        customfavIcon: 'https://exactehr.com/favicon.ico',
    };
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ExactEHRM API')
        .setDescription(`
## Monolithic HRM Backend

All-in-one HRM API with 25 service modules.

## Authentication
All endpoints (except /auth/login and /auth/register) require a Bearer token.
Click the **Authorize** button at the top to enter your JWT token.

### Login Examples:
- **Email login**: POST /api/v1/auth/login with { "email": "hr.admin@acaciagroup.co.tz", "password": "demo1234" }
- **Phone login**: POST /api/v1/auth/login/phone with { "phone": "+255712345678", "password": "demo1234" }
    `)
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'JWT-auth')
        .addTag('System', 'API system endpoints')
        .addTag('Authentication', 'Login, register, token management')
        .addTag('IAM - Users & Roles', 'User and role management')
        .addTag('Company', 'Companies, branches, departments, settings')
        .addTag('Employee', 'Employee records, documents, qualifications')
        .addTag('Attendance', 'Attendance, shifts, overtime, geofencing')
        .addTag('Leave', 'Leave requests, types, balances, encashment')
        .addTag('Payroll', 'Payroll runs, advances, deductions, journal')
        .addTag('Performance', 'Performance reviews, goals, KPIs')
        .addTag('Training', 'Training programs, enrollments, certifications')
        .addTag('Onboarding', 'Employee onboarding workflows')
        .addTag('Offboarding', 'Employee offboarding workflows')
        .addTag('Movement', 'Transfers, promotions')
        .addTag('Contracts', 'Contract management')
        .addTag('Assets', 'Asset management')
        .addTag('Benefits', 'Employee benefits')
        .addTag('Disciplinary', 'Disciplinary cases and actions')
        .addTag('Compliance', 'Compliance requirements and statutory filings')
        .addTag('Announcements', 'Company announcements')
        .addTag('Analytics', 'Dashboards and analytics')
        .addTag('Salary Intelligence', 'Salary benchmarking and analysis')
        .addTag('ExactAI', 'AI assistant')
        .addTag('Notifications', 'System notifications')
        .addTag('Tasks', 'Task management')
        .addTag('HR Query', 'HR Q&A and support tickets')
        .addTag('Documents', 'Document management')
        .addTag('Integrations', 'Third-party integrations and webhooks')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, swaggerCustomOptions);
    const port = process.env.PORT || process.env.GATEWAY_PORT || 3000;
    await app.listen(port, '0.0.0.0');
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`\n${'='.repeat(60)}`);
    logger.log(`ExactEHRM API running on http://localhost:${port}`);
    logger.log(`Swagger UI: http://localhost:${port}/api`);
    logger.log(`Health: http://localhost:${port}/api/v1/health`);
    logger.log(`Services: http://localhost:${port}/api/v1/services`);
    logger.log(`${'='.repeat(60)}\n`);
}
bootstrap().catch((err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map