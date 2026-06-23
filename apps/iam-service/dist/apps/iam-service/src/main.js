"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("../../../libs/common/src/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.GRPC,
        options: {
            package: ['ehrm.iam', 'ehrm.common'],
            protoPath: [
                (0, path_1.join)(__dirname, '..', '..', '..', '..', '..', '..', 'proto', 'iam.proto'),
                (0, path_1.join)(__dirname, '..', '..', '..', '..', '..', '..', 'proto', 'common.proto'),
            ],
            url: '0.0.0.0:5001',
        },
    });
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    await app.listen();
    console.log('IAM Service is running on port 5001');
}
bootstrap();
//# sourceMappingURL=main.js.map