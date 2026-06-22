import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '../../../libs/common/src/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: ['ehrm.payroll', 'ehrm.common'],
      protoPath: [
        join(__dirname, '..', '..', '..', 'proto', 'payroll.proto'),
        join(__dirname, '..', '..', '..', 'proto', 'common.proto'),
      ],
      url: '0.0.0.0:5006',
    },
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen();
  console.log('Payroll Service is running on port 5006');
}
bootstrap();
